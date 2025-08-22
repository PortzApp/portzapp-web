<?php

use App\Models\Invitation;
use App\Models\PasswordResetToken;
use App\Models\User;
use App\Services\SecureTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Cache::flush();
    $this->service = new SecureTokenService;
});

describe('Token Generation', function (): void {
    it('generates cryptographically secure tokens', function (): void {
        $token = $this->service->generateSecureToken();

        expect($token)->toBeString();
        expect(strlen($token))->toBe(64); // 32 bytes = 64 hex chars
        expect(ctype_xdigit($token))->toBeTrue(); // Only hex characters
    });

    it('generates unique tokens each time', function (): void {
        $tokens = [];
        for ($i = 0; $i < 100; $i++) {
            $tokens[] = $this->service->generateSecureToken();
        }

        expect(count(array_unique($tokens)))->toBe(100);
    });

    it('generates tokens of custom length', function (): void {
        $token16 = $this->service->generateSecureToken(16);
        $token64 = $this->service->generateSecureToken(64);

        expect(strlen($token16))->toBe(32); // 16 bytes = 32 hex chars
        expect(strlen($token64))->toBe(128); // 64 bytes = 128 hex chars
    });

    it('generates invitation tokens without collisions', function (): void {
        // Create an existing invitation with a known token
        $existingToken = 'existing_token_12345';
        Invitation::factory()->create(['token' => $existingToken]);

        // Mock the random generation to return the existing token first, then a new one
        $mockService = $this->partialMock(SecureTokenService::class);
        $mockService->shouldReceive('generateSecureToken')
            ->with(32)
            ->once()
            ->andReturn($existingToken)
            ->shouldReceive('generateSecureToken')
            ->with(32)
            ->once()
            ->andReturn('new_unique_token_67890');

        $token = $mockService->generateInvitationToken();

        expect($token)->toBe('new_unique_token_67890');
        expect($token)->not->toBe($existingToken);
    });
});

describe('Password Reset Tokens', function (): void {
    it('generates password reset token with expiry', function (): void {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $result = $this->service->generatePasswordResetToken($user);

        expect($result)->toHaveKeys(['token', 'expires_at']);
        expect($result['token'])->toBeString();
        expect(strlen($result['token']))->toBe(64); // 32 bytes = 64 hex chars
        expect($result['expires_at']->isAfter(now()))->toBeTrue();
        expect($result['expires_at']->diffInHours(now()))->toBe(1);
    });

    it('invalidates existing password reset tokens', function (): void {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create existing token
        PasswordResetToken::create([
            'email' => $user->email,
            'token' => Hash::make('old_token'),
            'created_at' => now(),
        ]);

        expect(PasswordResetToken::where('email', $user->email)->count())->toBe(1);

        $this->service->generatePasswordResetToken($user);

        // Should still have only 1 token (old one replaced)
        expect(PasswordResetToken::where('email', $user->email)->count())->toBe(1);
    });

    it('verifies valid password reset tokens', function (): void {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $result = $this->service->generatePasswordResetToken($user);

        $isValid = $this->service->verifyPasswordResetToken($user->email, $result['token']);

        expect($isValid)->toBeTrue();
    });

    it('rejects invalid password reset tokens', function (): void {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $this->service->generatePasswordResetToken($user);

        $isValid = $this->service->verifyPasswordResetToken($user->email, 'wrong_token');

        expect($isValid)->toBeFalse();
    });

    it('rejects expired password reset tokens', function (): void {
        $user = User::factory()->create(['email' => 'test@example.com']);

        // Create expired token manually
        $token = $this->service->generateSecureToken(32);
        PasswordResetToken::create([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now()->subHours(2), // Expired (older than 1 hour)
        ]);

        $isValid = $this->service->verifyPasswordResetToken($user->email, $token);

        expect($isValid)->toBeFalse();
        // Should also clean up expired token
        expect(PasswordResetToken::where('email', $user->email)->count())->toBe(0);
    });

    it('rejects tokens for non-existent emails', function (): void {
        $isValid = $this->service->verifyPasswordResetToken('nonexistent@example.com', 'any_token');

        expect($isValid)->toBeFalse();
    });
});

describe('API Key Generation', function (): void {
    it('generates secure API keys', function (): void {
        $user = User::factory()->create();

        $apiKey = $this->service->generateApiKey($user);

        expect($apiKey)->toBeString();
        expect(strlen($apiKey))->toBeGreaterThan(100); // Should be base64 encoded encrypted data
    });

    it('generates unique API keys for different users', function (): void {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $key1 = $this->service->generateApiKey($user1);
        $key2 = $this->service->generateApiKey($user2);

        expect($key1)->not->toBe($key2);
    });

    it('includes user and organization data in API key', function (): void {
        $user = User::factory()->create(['current_organization_id' => 'test-org-id']);

        $apiKey = $this->service->generateApiKey($user);

        // Decode and verify structure
        [$encrypted, $signature] = explode('.', base64_decode($apiKey));
        $payload = Crypt::decrypt($encrypted);

        expect($payload)->toHaveKeys(['user_id', 'organization_id', 'issued_at', 'expires_at']);
        expect($payload['user_id'])->toBe($user->id);
        expect($payload['organization_id'])->toBe('test-org-id');
        expect($payload['expires_at'])->toBeGreaterThan($payload['issued_at']);
    });
});

describe('Invitation Token Rotation', function (): void {
    it('rotates invitation tokens', function (): void {
        $invitation = Invitation::factory()->create(['token' => 'old_token']);

        $newToken = $this->service->rotateInvitationToken($invitation);

        $invitation->refresh();
        expect($invitation->token)->toBe($newToken);
        expect($invitation->token)->not->toBe('old_token');
        expect($invitation->token_rotated_at)->not->toBeNull();
    });

    it('ensures rotated tokens are unique', function (): void {
        $invitation1 = Invitation::factory()->create(['token' => 'token1']);
        $invitation2 = Invitation::factory()->create(['token' => 'token2']);

        $newToken1 = $this->service->rotateInvitationToken($invitation1);
        $newToken2 = $this->service->rotateInvitationToken($invitation2);

        expect($newToken1)->not->toBe($newToken2);
    });
});

describe('Form Token Security', function (): void {
    it('generates form tokens', function (): void {
        $token = $this->service->generateFormToken('login', 1);

        expect($token)->toBeString();
        expect(strlen($token))->toBe(64); // SHA256 hash
    });

    it('generates different tokens for different actions', function (): void {
        $loginToken = $this->service->generateFormToken('login', 1);
        $registerToken = $this->service->generateFormToken('register', 1);

        expect($loginToken)->not->toBe($registerToken);
    });

    it('generates different tokens for different users', function (): void {
        $user1Token = $this->service->generateFormToken('login', 1);
        $user2Token = $this->service->generateFormToken('login', 2);

        expect($user1Token)->not->toBe($user2Token);
    });
});

describe('Session Token Management', function (): void {
    it('generates session tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $token = $this->service->generateSessionToken('wizard', ['step' => 1]);

        expect($token)->toBeString();
        expect($token)->toContain('.'); // Should have sessionId.token format
    });

    it('stores and retrieves session data', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $testData = ['step' => 1, 'form_data' => ['name' => 'test']];
        $token = $this->service->generateSessionToken('wizard', $testData);

        $retrievedData = $this->service->getSessionData($token);

        expect($retrievedData)->toHaveKeys(['type', 'data', 'created_at', 'user_id', 'ip_address']);
        expect($retrievedData['type'])->toBe('wizard');
        expect($retrievedData['data'])->toBe($testData);
        expect($retrievedData['user_id'])->toBe($user->id);
    });

    it('rejects expired session tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $token = $this->service->generateSessionToken('wizard', ['step' => 1]);

        // Manually expire the session
        [$sessionId, $tokenPart] = explode('.', $token, 2);
        $sessionData = Cache::get("session_token:{$sessionId}");
        $sessionData['created_at'] = now()->subHours(2)->timestamp;
        Cache::put("session_token:{$sessionId}", $sessionData, 3600);

        $retrievedData = $this->service->getSessionData($token);

        expect($retrievedData)->toBeNull();
    });

    it('rejects session tokens for different users', function (): void {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->actingAs($user1);
        $token = $this->service->generateSessionToken('wizard', ['step' => 1]);

        $this->actingAs($user2);
        $retrievedData = $this->service->getSessionData($token);

        expect($retrievedData)->toBeNull();
    });

    it('invalidates session tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $token = $this->service->generateSessionToken('wizard', ['step' => 1]);

        expect($this->service->getSessionData($token))->not->toBeNull();

        $this->service->invalidateSessionToken($token);

        expect($this->service->getSessionData($token))->toBeNull();
    });
});

describe('Download Token Security', function (): void {
    it('generates download tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $token = $this->service->generateDownloadToken('/path/to/file.pdf', 30);

        expect($token)->toBeString();
        expect(strlen($token))->toBeGreaterThan(50); // Base64 encoded encrypted data
    });

    it('verifies valid download tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $filePath = '/path/to/file.pdf';
        $token = $this->service->generateDownloadToken($filePath, 30);

        $payload = $this->service->verifyDownloadToken($token);

        expect($payload)->toHaveKeys(['file_path', 'user_id', 'expires_at', 'ip_address']);
        expect($payload['file_path'])->toBe($filePath);
        expect($payload['user_id'])->toBe($user->id);
    });

    it('rejects expired download tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $token = $this->service->generateDownloadToken('/path/to/file.pdf', -1); // Expired

        $payload = $this->service->verifyDownloadToken($token);

        expect($payload)->toBeNull();
    });

    it('rejects download tokens for different users', function (): void {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->actingAs($user1);
        $token = $this->service->generateDownloadToken('/path/to/file.pdf', 30);

        $this->actingAs($user2);
        $payload = $this->service->verifyDownloadToken($token);

        expect($payload)->toBeNull();
    });

    it('rejects malformed download tokens', function (): void {
        $user = User::factory()->create();
        $this->actingAs($user);

        $payload = $this->service->verifyDownloadToken('invalid_token');

        expect($payload)->toBeNull();
    });
});

describe('Rate Limiting', function (): void {
    it('enforces token generation rate limits', function (): void {
        // Generate tokens up to the limit (10 per minute)
        for ($i = 0; $i < 10; $i++) {
            expect($this->service->isTokenGenerationRateLimited('test'))->toBeFalse();
        }

        // 11th attempt should be rate limited
        expect($this->service->isTokenGenerationRateLimited('test'))->toBeTrue();
    });

    it('uses different rate limits for different token types', function (): void {
        // Exhaust limit for 'type1'
        for ($i = 0; $i < 10; $i++) {
            $this->service->isTokenGenerationRateLimited('type1');
        }

        expect($this->service->isTokenGenerationRateLimited('type1'))->toBeTrue();
        expect($this->service->isTokenGenerationRateLimited('type2'))->toBeFalse();
    });
});

describe('Token Cleanup', function (): void {
    it('cleans up expired password reset tokens', function (): void {
        $user1 = User::factory()->create(['email' => 'user1@example.com']);
        $user2 = User::factory()->create(['email' => 'user2@example.com']);

        // Create expired and valid tokens
        PasswordResetToken::create([
            'email' => $user1->email,
            'token' => Hash::make('expired_token'),
            'created_at' => now()->subHours(2), // Expired
        ]);

        PasswordResetToken::create([
            'email' => $user2->email,
            'token' => Hash::make('valid_token'),
            'created_at' => now()->subMinutes(30), // Valid
        ]);

        expect(PasswordResetToken::count())->toBe(2);

        $cleaned = $this->service->cleanupExpiredTokens();

        expect($cleaned)->toBe(1);
        expect(PasswordResetToken::count())->toBe(1);
        expect(PasswordResetToken::where('email', $user2->email)->exists())->toBeTrue();
    });

    it('cleans up expired invitation tokens', function (): void {
        $expiredInvitation = Invitation::factory()->create([
            'expires_at' => now()->subDay(),
            'accepted_at' => null,
        ]);

        $validInvitation = Invitation::factory()->create([
            'expires_at' => now()->addDay(),
            'accepted_at' => null,
        ]);

        $acceptedInvitation = Invitation::factory()->create([
            'expires_at' => now()->subDay(),
            'accepted_at' => now()->subHour(),
        ]);

        expect(Invitation::count())->toBe(3);

        $cleaned = $this->service->cleanupExpiredTokens();

        expect($cleaned)->toBe(1); // Only expired unaccepted invitation should be cleaned
        expect(Invitation::count())->toBe(2);
        expect(Invitation::find($validInvitation->id))->not->toBeNull();
        expect(Invitation::find($acceptedInvitation->id))->not->toBeNull();
    });
});
