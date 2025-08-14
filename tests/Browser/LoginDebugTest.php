<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginDebugTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test to debug what's happening on the login page.
     */
    public function test_login_page_debug(): void
    {
        $this->browse(function (Browser $browser): void {
            $browser->visit('/login')
                ->waitFor('body', 10)
                ->screenshot('login-page-debug')
                ->dump(); // This will dump the page source
        });
    }

    /**
     * Test manual login form submission.
     */
    public function test_manual_login(): void
    {
        $adminUser = User::where('email', 'admin@shipping1.com')->first();

        $this->browse(function (Browser $browser) use ($adminUser): void {
            $browser->visit('/login')
                ->waitFor('body', 10)
                ->screenshot('login-page-before-auth');

            // Check if we can find common login form elements
            if ($browser->element('#email')) {
                $browser->type('#email', $adminUser->email)
                    ->type('#password', 'password')
                    ->screenshot('login-form-filled')
                    ->press('Log in')
                    ->waitFor('body', 10)
                    ->screenshot('after-login-attempt');
            } else {
                dump('Email field not found - check login page structure');
            }
        });
    }
}
