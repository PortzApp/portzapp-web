<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

describe('API Authentication', function () {
    it('can issue token with valid credentials', function () {
        $user = User::factory()->create();

        $response = $this->postJson('/api/sanctum/token', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'expo-app',
        ]);

        $response->assertSuccessful();
        $response->assertJsonStructure(['token']);
        expect($response->json('token'))->toBeString();
        expect($user->tokens()->count())->toBe(1);
        expect($user->tokens()->first()->name)->toBe('expo-app');
    });

    it('rejects invalid credentials', function () {
        $user = User::factory()->create();

        $response = $this->postJson('/api/sanctum/token', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'device_name' => 'expo-app',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email']);
    });

    it('requires all authentication fields', function () {
        $response = $this->postJson('/api/sanctum/token', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email', 'password', 'device_name']);
    });

    it('can access user data with valid token', function () {
        $user = User::factory()->create();

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/user');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'data' => [
                'id',
                'email',
                'first_name',
                'last_name',
                'phone_number',
                'email_verified_at',
                'current_organization_id',
                'onboarding_status',
                'onboarding_step',
                'created_at',
                'updated_at',
            ],
        ]);
        expect($response->json('data.email'))->toBe($user->email);
    });

    it('rejects unauthenticated requests to protected routes', function () {
        $response = $this->getJson('/api/user');

        $response->assertUnauthorized();
    });

    it('can logout and revoke token', function () {
        $user = User::factory()->create();
        $token = $user->createToken('expo-app')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->postJson('/api/logout');

        $response->assertSuccessful();
        $response->assertJson(['message' => 'Logged out successfully']);
        expect($user->tokens()->count())->toBe(0);
    });

    it('can create multiple tokens for different devices', function () {
        $user = User::factory()->create();

        $response1 = $this->postJson('/api/sanctum/token', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'iPhone App',
        ]);

        $response2 = $this->postJson('/api/sanctum/token', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'Android App',
        ]);

        $response1->assertSuccessful();
        $response2->assertSuccessful();
        expect($user->tokens()->count())->toBe(2);
        expect($user->tokens()->pluck('name')->toArray())->toContain('iPhone App', 'Android App');
    });
});
