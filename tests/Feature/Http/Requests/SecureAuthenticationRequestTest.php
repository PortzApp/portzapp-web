<?php

use App\Http\Requests\SecureAuthenticationRequest;
use App\Services\AuditLogService;
use App\Services\InputSanitizationService;
use App\Services\SecureTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    // Clear rate limiting between tests
    RateLimiter::clear('login_attempts:ip:127.0.0.1');
    RateLimiter::clear('login_attempts:email:test@example.com');
    Cache::flush();
});

describe('SecureAuthenticationRequest Authorization', function (): void {
    it('always allows authentication requests', function (): void {
        $request = new SecureAuthenticationRequest(
            new InputSanitizationService,
            new AuditLogService,
            new SecureTokenService
        );

        expect($request->authorize())->toBeTrue();
    });
});

describe('Login Request Validation', function (): void {
    it('accepts valid login data', function (): void {
        // Create a user with known credentials
        $user = \App\Models\User::factory()->create([
            'email' => 'testuser@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('SecurePassword123!'),
        ]);

        $this->post(route('login'), [
            'email' => 'testuser@example.com',
            'password' => 'SecurePassword123!',
            'remember' => false,
            '_token' => csrf_token(),
        ])->assertRedirect(route('dashboard'));
    });

    it('rejects invalid email formats', function (): void {
        $this->post(route('login'), [
            'email' => 'invalid-email',
            'password' => 'password',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('email');
    });

    it('rejects missing password', function (): void {
        $this->post(route('login'), [
            'email' => 'test@example.com',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('password');
    });

    it('rejects missing CSRF token', function (): void {
        $this->post(route('login'), [
            'email' => 'test@example.com',
            'password' => 'password',
        ])->assertSessionHasErrors('_token');
    });
});

describe('Registration Request Validation', function (): void {
    it('validates required fields for registration', function (): void {
        $request = new SecureAuthenticationRequest(
            new InputSanitizationService,
            new AuditLogService,
            new SecureTokenService
        );

        $request->setMethod('POST');
        $request->setRouteResolver(function () {
            return (object) ['named' => fn ($name) => $name === 'register'];
        });

        $rules = $request->rules();

        expect($rules)->toHaveKeys([
            'first_name', 'last_name', 'email', 'phone_number', 'password', '_token',
        ]);

        expect($rules['first_name'])->toContain('required', 'string', 'max:255', 'min:2');
        expect($rules['last_name'])->toContain('required', 'string', 'max:255', 'min:2');
        expect($rules['email'])->toContain('required', 'email:rfc,dns', 'unique:users,email');
        expect($rules['phone_number'])->toContain('required', 'string', 'max:25');
    });

    it('accepts valid registration data', function (): void {
        $this->post(route('register'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone_number' => '+971551234567',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
        ])->assertRedirect(route('onboarding.index'));

        $this->assertDatabaseHas('users', [
            'email' => 'john.doe@example.com',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);
    });

    it('rejects weak passwords', function (): void {
        $this->post(route('register'), [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('password');
    });

    it('rejects names with invalid characters', function (): void {
        $this->post(route('register'), [
            'name' => 'John<script>alert("xss")</script>',
            'email' => 'john.doe@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'terms' => true,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('name');
    });

    it('rejects duplicate email addresses', function (): void {
        // Create existing user
        \App\Models\User::factory()->create(['email' => 'existing@example.com']);

        $this->post(route('register'), [
            'name' => 'John Doe',
            'email' => 'existing@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'terms' => true,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('email');
    });

    it('rejects registration without accepting terms', function (): void {
        $this->post(route('register'), [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'terms' => false,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('terms');
    });

    it('rejects short names', function (): void {
        $this->post(route('register'), [
            'name' => 'J',
            'email' => 'john.doe@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'terms' => true,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('name');
    });
});

describe('Password Reset Request Validation', function (): void {
    it('validates email for password reset request', function (): void {
        $user = \App\Models\User::factory()->create(['email' => 'user@example.com']);

        $this->post(route('password.email'), [
            'email' => 'user@example.com',
            '_token' => csrf_token(),
        ])->assertSessionHas('status');
    });

    it('rejects non-existent email for password reset', function (): void {
        $this->post(route('password.email'), [
            'email' => 'nonexistent@example.com',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('email');
    });
});

describe('Security Features', function (): void {
    it('sanitizes email input during preparation', function (): void {
        // This test verifies the prepareForValidation method works
        $sanitizer = $this->mock(InputSanitizationService::class);
        $auditLogger = $this->mock(AuditLogService::class);
        $tokenService = $this->mock(SecureTokenService::class);

        $sanitizer->shouldReceive('isIpAddressSuspicious')
            ->with('127.0.0.1')
            ->once()
            ->andReturn(false);

        $sanitizer->shouldReceive('sanitizeEmail')
            ->with('  TEST@EXAMPLE.COM  ')
            ->once()
            ->andReturn('test@example.com');

        $request = new SecureAuthenticationRequest($sanitizer, $auditLogger, $tokenService);
        $request->merge(['email' => '  TEST@EXAMPLE.COM  ']);
        $request->setMethod('POST');

        // Call prepareForValidation through reflection since it's protected
        $reflection = new \ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        expect($request->email)->toBe('test@example.com');
    });

    it('blocks suspicious IP addresses', function (): void {
        $sanitizer = $this->mock(InputSanitizationService::class);
        $auditLogger = $this->mock(AuditLogService::class);
        $tokenService = $this->mock(SecureTokenService::class);

        $sanitizer->shouldReceive('isIpAddressSuspicious')
            ->with('127.0.0.1')
            ->once()
            ->andReturn(true);

        $auditLogger->shouldReceive('logSecurityEvent')
            ->once();

        $request = new SecureAuthenticationRequest($sanitizer, $auditLogger, $tokenService);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->expectExceptionMessage('Authentication not allowed from this location.');

        // Call prepareForValidation through reflection
        $reflection = new \ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);
    });

    it('enforces rate limiting for login attempts', function (): void {
        $user = \App\Models\User::factory()->create([
            'email' => 'test@example.com',
        ]);

        // Make multiple failed login attempts to trigger rate limiting
        for ($i = 0; $i < 11; $i++) {
            $this->post(route('login'), [
                'email' => 'test@example.com',
                'password' => 'wrong-password',
                '_token' => csrf_token(),
            ]);
        }

        // The 11th attempt should be rate limited (threshold is 10)
        $response = $this->post(route('login'), [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
            '_token' => csrf_token(),
        ]);

        $response->assertStatus(429);
    });

    it('detects weak password patterns', function (): void {
        $weakPasswords = [
            '123456789',
            'password123',
            'qwerty123',
            'admin123',
            'welcome123',
            'aaaa1234!', // repeated characters
        ];

        foreach ($weakPasswords as $weakPassword) {
            $this->post(route('register'), [
                'name' => 'Test User',
                'email' => 'test'.uniqid().'@example.com',
                'password' => $weakPassword,
                'password_confirmation' => $weakPassword,
                'terms' => true,
                '_token' => csrf_token(),
            ])->assertSessionHasErrors('password');
        }
    });

    it('detects suspicious registration patterns', function (): void {
        // Test rapid registrations from same IP
        for ($i = 0; $i < 3; $i++) {
            \Illuminate\Support\Facades\Cache::put('registrations:ip:127.0.0.1', $i, 3600);

            $this->post(route('register'), [
                'name' => 'User '.$i,
                'email' => 'user'.$i.'@example.com',
                'password' => 'SecurePassword123!',
                'password_confirmation' => 'SecurePassword123!',
                'terms' => true,
                '_token' => csrf_token(),
            ]);
        }

        // Fourth registration should be blocked
        $this->post(route('register'), [
            'name' => 'User 4',
            'email' => 'user4@example.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'terms' => true,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('security');
    });

    it('rejects temporary email domains', function (): void {
        $this->post(route('register'), [
            'name' => 'Test User',
            'email' => 'test@10minutemail.com',
            'password' => 'SecurePassword123!',
            'password_confirmation' => 'SecurePassword123!',
            'terms' => true,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('email');
    });

    it('rejects suspicious names', function (): void {
        $suspiciousNames = ['test user', 'admin user', 'demo account', 'spam bot'];

        foreach ($suspiciousNames as $name) {
            $this->post(route('register'), [
                'name' => $name,
                'email' => 'user'.uniqid().'@example.com',
                'password' => 'SecurePassword123!',
                'password_confirmation' => 'SecurePassword123!',
                'terms' => true,
                '_token' => csrf_token(),
            ])->assertSessionHasErrors('name');
        }
    });

    it('logs successful and failed authentication attempts', function (): void {
        $auditLogger = $this->mock(AuditLogService::class);

        // Test failed attempt logging
        $auditLogger->shouldReceive('logAuthentication')
            ->with('login_failed', null, \Mockery::type('array'))
            ->once();

        $user = \App\Models\User::factory()->create(['email' => 'test@example.com']);

        $this->post(route('login'), [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
            '_token' => csrf_token(),
        ]);

        // Test successful attempt logging
        $auditLogger->shouldReceive('logAuthentication')
            ->with('login_successful', \Mockery::type(\App\Models\User::class), \Mockery::type('array'))
            ->once();

        $this->post(route('login'), [
            'email' => 'test@example.com',
            'password' => 'password',
            '_token' => csrf_token(),
        ]);
    });

    it('clears rate limiting on successful authentication', function (): void {
        $user = \App\Models\User::factory()->create(['email' => 'test@example.com']);

        // Make a few failed attempts first
        for ($i = 0; $i < 3; $i++) {
            $this->post(route('login'), [
                'email' => 'test@example.com',
                'password' => 'wrong-password',
                '_token' => csrf_token(),
            ]);
        }

        // Verify rate limiting counter exists
        expect(RateLimiter::attempts('login_attempts:email:test@example.com'))->toBeGreaterThan(0);

        // Successful login should clear rate limiting
        $this->post(route('login'), [
            'email' => 'test@example.com',
            'password' => 'password',
            '_token' => csrf_token(),
        ])->assertRedirect(route('dashboard'));

        // Rate limiting should be cleared
        expect(RateLimiter::attempts('login_attempts:email:test@example.com'))->toBe(0);
    });
});
