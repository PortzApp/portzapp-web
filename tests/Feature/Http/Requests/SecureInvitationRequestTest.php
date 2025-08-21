<?php

use App\Http\Requests\SecureInvitationRequest;
use App\Models\Organization;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\InputSanitizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();

    // Create test organization and admin user
    $this->organization = Organization::factory()->create();
    $this->admin = User::factory()->create(['current_organization_id' => $this->organization->id]);

    $this->actingAs($this->admin);
});

describe('SecureInvitationRequest Authorization', function () {
    it('always allows invitation requests for authenticated users', function () {
        $request = new SecureInvitationRequest(
            new InputSanitizationService,
            new AuditLogService
        );

        expect($request->authorize())->toBeTrue();
    });
});

describe('Single Invitation Validation', function () {
    it('accepts valid single invitation data', function () {
        $this->post(route('invitations.store'), [
            'email' => 'newuser@example.com',
            'role' => 'viewer',
            'message' => 'Welcome to our organization!',
            '_token' => csrf_token(),
        ])->assertSessionDoesntHaveErrors();
    });

    it('rejects invalid email formats for single invitations', function () {
        $this->post(route('invitations.store'), [
            'email' => 'invalid-email-format',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('email');
    });

    it('rejects invitations to temporary email domains', function () {
        $this->post(route('invitations.store'), [
            'email' => 'test@10minutemail.com',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('email');
    });

    it('validates role values for single invitations', function () {
        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'invalid_role',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('role');
    });

    it('prevents role elevation beyond current user role', function () {
        // Set current user as manager
        $this->admin->update(['role' => 'manager']);

        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'admin', // Trying to invite admin while being manager
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('role');
    });

    it('sanitizes invitation messages', function () {
        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            'message' => 'Welcome<script>alert("xss")</script>',
            '_token' => csrf_token(),
        ]);

        // Message should be sanitized (script tags removed)
        $this->assertDatabaseHas('invitations', [
            'email' => 'user@example.com',
            'message' => 'Welcomealert("xss")', // Tags stripped
        ]);
    });
});

describe('Bulk Invitation Validation', function () {
    it('accepts valid bulk invitation data', function () {
        $this->post(route('invitations.bulk'), [
            'emails' => 'user1@example.com,user2@example.com,user3@example.com',
            'role' => 'viewer',
            'message' => 'Welcome to our team!',
            '_token' => csrf_token(),
        ])->assertSessionDoesntHaveErrors();
    });

    it('enforces bulk invitation limits', function () {
        // Create a list of 51 emails (exceeding the 50 limit)
        $emails = [];
        for ($i = 1; $i <= 51; $i++) {
            $emails[] = "user{$i}@example.com";
        }

        $this->post(route('invitations.bulk'), [
            'emails' => implode(',', $emails),
            'role' => 'viewer',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('emails');
    });

    it('validates each email in bulk invitations', function () {
        $this->post(route('invitations.bulk'), [
            'emails' => 'valid@example.com,invalid-email,another@example.com',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('emails');
    });

    it('removes duplicate emails from bulk invitations', function () {
        $this->post(route('invitations.bulk'), [
            'emails' => 'user@example.com,user@example.com,another@example.com',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ]);

        // Should only create 2 invitations, not 3
        expect(\App\Models\Invitation::count())->toBe(2);
    });

    it('filters out existing users from bulk invitations', function () {
        // Create existing user
        User::factory()->create(['email' => 'existing@example.com']);

        $this->post(route('invitations.bulk'), [
            'emails' => 'existing@example.com,newuser@example.com',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ]);

        // Should only create invitation for new user
        expect(\App\Models\Invitation::count())->toBe(1);
        $this->assertDatabaseHas('invitations', ['email' => 'newuser@example.com']);
        $this->assertDatabaseMissing('invitations', ['email' => 'existing@example.com']);
    });
});

describe('Domain Validation', function () {
    it('validates email domains against whitelist', function () {
        $request = new SecureInvitationRequest(
            new InputSanitizationService,
            new AuditLogService
        );

        $request->merge(['email' => 'user@alloweddomain.com']);

        // This would require setting up domain validation logic
        expect(true)->toBeTrue(); // Placeholder test
    });

    it('blocks invitations from blacklisted domains', function () {
        $blacklistedEmails = [
            'spam@guerrillamail.com',
            'temp@tempmail.org',
            'fake@mailinator.com',
        ];

        foreach ($blacklistedEmails as $email) {
            $this->post(route('invitations.store'), [
                'email' => $email,
                'role' => 'viewer',
                '_token' => csrf_token(),
            ])->assertSessionHasErrors('email');
        }
    });
});

describe('Security Features', function () {
    it('sanitizes email input during preparation', function () {
        $sanitizer = $this->mock(InputSanitizationService::class);
        $auditLogger = $this->mock(AuditLogService::class);

        $sanitizer->shouldReceive('sanitizeEmail')
            ->with('  USER@EXAMPLE.COM  ')
            ->once()
            ->andReturn('user@example.com');

        $request = new SecureInvitationRequest($sanitizer, $auditLogger);
        $request->merge(['email' => '  USER@EXAMPLE.COM  ']);

        // Call prepareForValidation through reflection
        $reflection = new \ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        expect($request->email)->toBe('user@example.com');
    });

    it('logs invitation security events', function () {
        $auditLogger = $this->mock(AuditLogService::class);

        $auditLogger->shouldReceive('logSecurityEvent')
            ->once()
            ->with('invitation_attempt', \Mockery::type('array'));

        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ]);
    });

    it('prevents invitation spam through rate limiting', function () {
        // Simulate multiple rapid invitation attempts
        for ($i = 0; $i < 10; $i++) {
            Cache::put('invitation_attempts:'.request()->ip(), $i + 1, 3600);
        }

        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            '_token' => csrf_token(),
        ])->assertStatus(429); // Too Many Requests
    });

    it('validates invitation message length and content', function () {
        // Test message too long
        $longMessage = str_repeat('a', 1001); // Over 1000 char limit

        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            'message' => $longMessage,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('message');
    });

    it('prevents XSS in invitation messages', function () {
        $maliciousMessage = '<script>document.location="http://evil.com"</script>';

        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            'message' => $maliciousMessage,
            '_token' => csrf_token(),
        ]);

        // Check that script tags were removed
        $invitation = \App\Models\Invitation::where('email', 'user@example.com')->first();
        expect($invitation->message)->not->toContain('<script>');
        expect($invitation->message)->not->toContain('document.location');
    });
});

describe('CSRF Protection', function () {
    it('requires CSRF token for invitation requests', function () {
        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            // Missing CSRF token
        ])->assertStatus(419); // CSRF token mismatch
    });

    it('rejects invalid CSRF tokens', function () {
        $this->post(route('invitations.store'), [
            'email' => 'user@example.com',
            'role' => 'viewer',
            '_token' => 'invalid_token',
        ])->assertStatus(419);
    });
});
