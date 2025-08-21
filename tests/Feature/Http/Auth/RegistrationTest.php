<?php

test('registration screen can be rendered', function (): void {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function (): void {
    $response = $this->post('/register', [
        'first_name' => 'Test First Name',
        'last_name' => 'Test Last Name',
        'email' => 'test@example.com',
        'phone_number' => '+971 55 1234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('onboarding.index', absolute: false));
});

test('users can register with valid phone number', function (): void {
    $response = $this->post('/register', [
        'first_name' => 'Agency Admin',
        'last_name' => 'User',
        'email' => 'admin@shipping.com',
        'phone_number' => '+971 55 9876543',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('onboarding.index', absolute: false));
});

test('users get onboarding status after registration', function (): void {
    $response = $this->post('/register', [
        'first_name' => 'Team',
        'last_name' => 'Member',
        'email' => 'member@company.com',
        'phone_number' => '+971 55 5555555',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('onboarding.index', absolute: false));

    // Verify user has pending onboarding status (ready to start onboarding)
    $user = \App\Models\User::where('email', 'member@company.com')->first();
    expect($user->onboarding_status)->toBe(\App\Enums\OnboardingStatus::PENDING);
});
