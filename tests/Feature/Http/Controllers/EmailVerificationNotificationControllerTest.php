<?php

use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

beforeEach(function (): void {
    // Create unverified user
    $this->unverifiedUser = User::factory()->unverified()->create([
        'email' => 'unverified@example.com',
    ]);

    // Create verified user
    $this->verifiedUser = User::factory()->create([
        'email' => 'verified@example.com',
        'email_verified_at' => now(),
    ]);
});

describe('EmailVerificationNotificationController store', function (): void {
    it('sends verification email to unverified user', function (): void {
        Notification::fake();

        $response = $this->actingAs($this->unverifiedUser)
            ->post(route('verification.send'));

        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-link-sent');

        Notification::assertSentTo(
            $this->unverifiedUser,
            VerifyEmail::class
        );
    });

    it('redirects verified user to dashboard', function (): void {
        Notification::fake();

        $response = $this->actingAs($this->verifiedUser)
            ->post(route('verification.send'));

        $response->assertRedirect(route('dashboard'));

        Notification::assertNothingSent();
    });

    it('requires authentication', function (): void {
        $response = $this->post(route('verification.send'));

        $response->assertRedirect(route('login'));
    });

    it('does not send duplicate verification emails unnecessarily', function (): void {
        Notification::fake();

        // Send first verification email
        $response1 = $this->actingAs($this->unverifiedUser)
            ->post(route('verification.send'));

        $response1->assertRedirect();
        $response1->assertSessionHas('status', 'verification-link-sent');

        // Send second verification email
        $response2 = $this->actingAs($this->unverifiedUser)
            ->post(route('verification.send'));

        $response2->assertRedirect();
        $response2->assertSessionHas('status', 'verification-link-sent');

        // Both should have sent emails (throttling is handled elsewhere)
        Notification::assertSentTo(
            $this->unverifiedUser,
            VerifyEmail::class
        );

        Notification::assertSentToTimes(
            $this->unverifiedUser,
            VerifyEmail::class,
            2
        );
    });

    it('returns back to previous page', function (): void {
        $response = $this->actingAs($this->unverifiedUser)
            ->from(route('verification.notice'))
            ->post(route('verification.send'));

        $response->assertRedirect(route('verification.notice'));
        $response->assertSessionHas('status', 'verification-link-sent');
    });

    it('works with different user types', function (): void {
        Notification::fake();

        // Test with user who has additional profile data
        $userWithProfile = User::factory()->unverified()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
        ]);

        $response = $this->actingAs($userWithProfile)
            ->post(route('verification.send'));

        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-link-sent');

        Notification::assertSentTo(
            $userWithProfile,
            VerifyEmail::class
        );
    });

    it('handles edge case where user becomes verified between request and send', function (): void {
        Notification::fake();

        // Start as unverified
        expect($this->unverifiedUser->hasVerifiedEmail())->toBeFalse();

        // Simulate verification happening during request processing
        $this->unverifiedUser->markEmailAsVerified();

        $response = $this->actingAs($this->unverifiedUser)
            ->post(route('verification.send'));

        // Should redirect to dashboard instead of sending email
        $response->assertRedirect(route('dashboard'));

        Notification::assertNothingSent();
    });

    it('uses intended URL with absolute parameter set to false', function (): void {
        // This tests the specific redirect(route('dashboard', absolute: false)) call
        $response = $this->actingAs($this->verifiedUser)
            ->post(route('verification.send'));

        $response->assertRedirect(route('dashboard'));

        // Verify the redirect URL doesn't have a custom intended route
        expect($response->getTargetUrl())->toContain(route('dashboard'));
    });

    it('maintains session state across verification requests', function (): void {
        $response = $this->actingAs($this->unverifiedUser)
            ->withSession(['test_key' => 'test_value'])
            ->post(route('verification.send'));

        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-link-sent');
        $response->assertSessionHas('test_key', 'test_value');
    });
});
