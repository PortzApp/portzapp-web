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
        'company_name' => 'Test Company Name',
        'company_registration_code' => 'REG-TEST001',
        'password' => 'password',
        'password_confirmation' => 'password',
        'user_role' => 'admin',
        'organization_business_type' => 'vessel_owner',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can register as shipping agency admin', function (): void {
    $response = $this->post('/register', [
        'first_name' => 'Agency Admin',
        'last_name' => 'User',
        'email' => 'admin@shipping.com',
        'phone_number' => '+971 55 9876543',
        'company_name' => 'Test Shipping Agency',
        'company_registration_code' => 'REG-SHIP001',
        'password' => 'password',
        'password_confirmation' => 'password',
        'user_role' => 'admin',
        'organization_business_type' => 'shipping_agency',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can register as organization member', function (): void {
    $response = $this->post('/register', [
        'first_name' => 'Team',
        'last_name' => 'Member',
        'email' => 'member@company.com',
        'phone_number' => '+971 55 5555555',
        'company_name' => 'Test Vessel Company',
        'company_registration_code' => 'REG-VESSEL001',
        'password' => 'password',
        'password_confirmation' => 'password',
        'user_role' => 'member',
        'organization_business_type' => 'vessel_owner',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});
