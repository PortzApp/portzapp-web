<?php

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;

uses(DatabaseTruncation::class);

test('user can access registration page', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/register')
            ->waitForText('Create an account', 10) // Wait for React to render
            ->assertSee('Create an account')
            ->waitForText('First name', 5)
            ->assertSee('First name')
            ->assertSee('Last name')
            ->assertSee('Email address')
            ->assertSee('Phone number')
            ->assertSee('Company name');
    });
});

test('user can register a new account successfully', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/register')
            ->waitForText('Create an account', 10) // Wait for React to render
            ->type('#first_name', 'Test')
            ->type('#last_name', 'User')
            ->type('#email', 'testuser@example.com')
            ->type('#phone_number', '+971 55 1234567')
            ->type('#company_name', 'Test Company')
            ->type('#company_registration_code', 'REG-TEST001')
            ->type('#password', 'password')
            ->type('#password_confirmation', 'password')
            ->click('#admin_role') // Select admin role radio button
            ->click('#vessel_owner_business') // Select vessel owner business type
            ->scrollIntoView('button[type="submit"]') // Scroll to button to avoid debug bar
            ->click('button[type="submit"]') // Click submit button directly
            ->pause(1000) // Wait for form submission and redirect
            ->assertPathIsNot('/register'); // Assert we've left the registration page
    });
});
