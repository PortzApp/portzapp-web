<?php

namespace App\Http\Controllers\Auth;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Throwable
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone_number' => ['required', 'string', 'max:25'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_registration_code' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'user_role' => [Rule::enum(UserRoles::class)],
            'organization_business_type' => [Rule::enum(OrganizationBusinessType::class)],
        ]);

        $user = DB::transaction(function () use ($validated) {
            // Create the organization with business type
            $organization = Organization::create([
                'name' => $validated['company_name'],
                'registration_code' => $validated['company_registration_code'],
                'business_type' => $validated['organization_business_type'],
            ]);

            // Create the user without role field
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'],
                'password' => Hash::make($validated['password']),
            ]);

            // Attach user to organization with their role in the pivot table
            $user->organizations()->attach($organization->id, [
                'role' => $validated['user_role'],
            ]);

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
