<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('viewAny', Organization::class);

        $organizations = Organization::withCount('users')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('organizations/organizations-index-page', [
            'organizations' => $organizations,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Organization::class);

        return Inertia::render('organizations/create-organization-page', [
            'businessTypes' => collect(OrganizationBusinessType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Organization::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'registration_code' => 'required|string|max:255|unique:organizations',
            'business_type' => 'required|in:'.implode(',', array_map(fn ($case) => $case->value, OrganizationBusinessType::cases())),
        ]);

        $organization = Organization::create([
            'name' => $validated['name'],
            'registration_code' => $validated['registration_code'],
            'business_type' => OrganizationBusinessType::from($validated['business_type']),
        ]);

        return redirect()->route('organizations.index')
            ->with('message', 'Organization created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Organization $organization)
    {
        Gate::authorize('view', $organization);

        $organization->load('users');

        return Inertia::render('organizations/show-organization-page', [
            'organization' => $organization,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(?Organization $organization = null)
    {
        // Handle the existing edit functionality for user's current organization
        if ($organization === null) {
            /** @var User $user */
            $user = auth()->user();

            // Check if the user has a current organization
            if (! $user->current_organization_id) {
                abort(404, 'No current organization found.');
            }

            // Get the user's current organization
            /** @var Organization|null $currentOrganization */
            $currentOrganization = $user->currentOrganization;

            if (! $currentOrganization) {
                abort(404, 'Current organization not found.');
            }

            // Fetch users with their pivot data (including roles) for the current organization
            $organizationUsers = $currentOrganization->users()->get();

            return Inertia::render('settings/organization', [
                'users' => $organizationUsers,
                'organization' => $currentOrganization,
            ]);
        }

        Gate::authorize('update', $organization);

        // Load organization members with their roles
        $organization->load('users');

        // Get all users that are not already in this organization for the add member functionality
        $availableUsers = User::whereDoesntHave('organizations', function ($query) use ($organization) {
            $query->where('organization_id', $organization->id);
        })->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('organizations/edit-organization-page', [
            'organization' => $organization,
            'availableUsers' => $availableUsers,
            'businessTypes' => collect(OrganizationBusinessType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
            'userRoles' => collect(UserRoles::cases())->map(fn ($role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Organization $organization)
    {
        Gate::authorize('update', $organization);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'registration_code' => 'required|string|max:255|unique:organizations,registration_code,'.$organization->id,
            'business_type' => 'required|in:'.implode(',', array_map(fn ($case) => $case->value, OrganizationBusinessType::cases())),
        ]);

        $organization->update([
            'name' => $validated['name'],
            'registration_code' => $validated['registration_code'],
            'business_type' => OrganizationBusinessType::from($validated['business_type']),
        ]);

        return redirect()->route('organizations.index')
            ->with('message', 'Organization updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Organization $organization)
    {
        Gate::authorize('delete', $organization);

        // Prevent deletion of organizations with users
        if ($organization->users()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete organization with existing users. Please remove all users first.');
        }

        // Prevent deletion of organizations with vessels
        if ($organization->vessels()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete organization with existing vessels. Please remove all vessels first.');
        }

        // Prevent deletion of organizations with services
        if ($organization->services()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete organization with existing services. Please remove all services first.');
        }

        $organization->delete();

        return redirect()->route('organizations.index')
            ->with('message', 'Organization deleted successfully!');
    }

    /**
     * Add a user to the organization.
     */
    public function addMember(Request $request, Organization $organization)
    {
        Gate::authorize('update', $organization);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:'.implode(',', array_map(fn ($case) => $case->value, UserRoles::cases())),
        ]);

        $user = User::find($validated['user_id']);

        // Check if user is already a member
        if ($organization->users()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->withErrors([
                'user_id' => 'User is already a member of this organization.',
            ]);
        }

        // Add the user to the organization with the specified role
        $organization->users()->attach($user->id, [
            'role' => UserRoles::from($validated['role']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('message', 'Member added successfully!');
    }

    /**
     * Remove a user from the organization.
     */
    public function removeMember(Organization $organization, User $user)
    {
        Gate::authorize('update', $organization);

        // Check if user is a member
        if (! $organization->users()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'User is not a member of this organization.',
            ]);
        }

        // If this is the user's current organization, clear their current_organization_id
        if ($user->current_organization_id === $organization->id) {
            $user->update(['current_organization_id' => null]);
        }

        // Remove the user from the organization
        $organization->users()->detach($user->id);

        return redirect()->back()->with('message', 'Member removed successfully!');
    }

    /**
     * Update a user's role in the organization.
     */
    public function updateMemberRole(Request $request, Organization $organization, User $user)
    {
        Gate::authorize('update', $organization);

        $validated = $request->validate([
            'role' => 'required|in:'.implode(',', array_map(fn ($case) => $case->value, UserRoles::cases())),
        ]);

        // Check if user is a member
        if (! $organization->users()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'User is not a member of this organization.',
            ]);
        }

        // Update the user's role
        $organization->users()->updateExistingPivot($user->id, [
            'role' => UserRoles::from($validated['role']),
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('message', 'Member role updated successfully!');
    }
}
