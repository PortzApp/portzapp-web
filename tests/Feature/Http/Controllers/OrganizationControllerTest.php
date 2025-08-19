<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\Service;
use App\Models\User;
use App\Models\Vessel;

beforeEach(function (): void {
    // Create organizations
    $this->portzappOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PORTZAPP_TEAM,
        'name' => 'PortzApp Team',
    ]);

    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Test Shipping Agency',
        'registration_code' => 'SA001',
    ]);

    $this->vesselOwnerOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Test Vessel Owner',
        'registration_code' => 'VO001',
    ]);

    // Create users
    $this->portzappAdmin = User::factory()->create(['current_organization_id' => $this->portzappOrg->id]);
    $this->portzappAdmin->organizations()->attach($this->portzappOrg, ['role' => UserRoles::ADMIN]);

    $this->portzappViewer = User::factory()->create(['current_organization_id' => $this->portzappOrg->id]);
    $this->portzappViewer->organizations()->attach($this->portzappOrg, ['role' => UserRoles::VIEWER]);

    $this->shippingAgencyAdmin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN]);

    $this->vesselOwnerAdmin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN]);

    $this->unattachedUser = User::factory()->create();
});

describe('OrganizationController index', function (): void {
    it('allows PORTZAPP_TEAM users to view all organizations', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('organizations.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('organizations/organizations-index-page')
            ->has('organizations', 3) // Should see all 3 organizations
            ->has('organizations.0.users_count') // Should have user count
        );
    });

    it('denies VESSEL_OWNER users from viewing organizations', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('organizations.index'));

        $response->assertForbidden();
    });

    it('denies SHIPPING_AGENCY users from viewing organizations', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('organizations.index'));

        $response->assertForbidden();
    });

    it('redirects unauthenticated users to login', function (): void {
        $response = $this->get(route('organizations.index'));

        $response->assertRedirect(route('login'));
    });
});

describe('OrganizationController create', function (): void {
    it('allows PORTZAPP_TEAM admin to view create form', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('organizations.create'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('organizations/create-organization-page')
            ->has('businessTypes')
        );
    });

    it('denies PORTZAPP_TEAM non-admin users from viewing create form', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->get(route('organizations.create'));

        $response->assertForbidden();
    });

    it('denies other organization types from viewing create form', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('organizations.create'));

        $response->assertForbidden();
    });
});

describe('OrganizationController store', function (): void {
    it('allows PORTZAPP_TEAM admin to create organization', function (): void {
        $orgData = [
            'name' => 'New Organization',
            'registration_code' => 'NEW001',
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.store'), $orgData);

        $response->assertRedirect(route('organizations.index'));
        $response->assertSessionHas('message', 'Organization created successfully!');

        $this->assertDatabaseHas('organizations', [
            'name' => 'New Organization',
            'registration_code' => 'NEW001',
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ]);
    });

    it('validates required fields', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.store'), []);

        $response->assertSessionHasErrors(['name', 'registration_code', 'business_type']);
    });

    it('validates unique registration code', function (): void {
        $orgData = [
            'name' => 'New Organization',
            'registration_code' => 'SA001', // Already exists
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.store'), $orgData);

        $response->assertSessionHasErrors('registration_code');
    });

    it('validates business type enum', function (): void {
        $orgData = [
            'name' => 'New Organization',
            'registration_code' => 'NEW001',
            'business_type' => 'invalid_type',
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.store'), $orgData);

        $response->assertSessionHasErrors('business_type');
    });

    it('denies non-admin users from creating organizations', function (): void {
        $orgData = [
            'name' => 'New Organization',
            'registration_code' => 'NEW001',
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ];

        $response = $this->actingAs($this->portzappViewer)
            ->post(route('organizations.store'), $orgData);

        $response->assertForbidden();
    });
});

describe('OrganizationController show', function (): void {
    it('allows PORTZAPP_TEAM users to view organization details', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('organizations.show', $this->shippingAgencyOrg));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('organizations/show-organization-page')
            ->has('organization')
            ->has('organization.users')
        );
    });

    it('denies non-PORTZAPP_TEAM users from viewing organization details', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('organizations.show', $this->shippingAgencyOrg));

        $response->assertForbidden();
    });
});

describe('OrganizationController edit', function (): void {
    it('shows current organization settings when no organization parameter provided', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('organization.edit'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('settings/organization')
            ->has('organization')
            ->has('users')
        );
    });

    it('shows specific organization edit form for PORTZAPP_TEAM', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('organizations.edit', $this->shippingAgencyOrg));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('organizations/edit-organization-page')
            ->has('organization')
            ->has('availableUsers')
            ->has('businessTypes')
            ->has('userRoles')
        );
    });

    it('handles user without current organization', function (): void {
        $userWithoutOrg = User::factory()->create(['current_organization_id' => null]);

        $response = $this->actingAs($userWithoutOrg)
            ->get(route('organization.edit'));

        $response->assertNotFound();
    });

    it('handles current organization soft deleted', function (): void {
        // Create organization and user
        $tempOrg = Organization::factory()->create([
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        ]);
        $userWithDeletedOrg = User::factory()->create(['current_organization_id' => $tempOrg->id]);

        // Soft delete the organization (if your model supports this) or delete it entirely
        $tempOrg->delete();

        $response = $this->actingAs($userWithDeletedOrg)
            ->get(route('organization.edit'));

        $response->assertNotFound();
    });

    it('excludes existing members from available users list', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('organizations.edit', $this->shippingAgencyOrg));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->where('availableUsers', fn ($users) => ! collect($users)->contains('id', $this->shippingAgencyAdmin->id)
            )
        );
    });
});

describe('OrganizationController update', function (): void {
    it('allows authorized users to update organization', function (): void {
        $updateData = [
            'name' => 'Updated Organization Name',
            'registration_code' => 'UPD001',
            'business_type' => OrganizationBusinessType::VESSEL_OWNER->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->patch(route('organizations.update', $this->shippingAgencyOrg), $updateData);

        $response->assertRedirect(route('organizations.index'));
        $response->assertSessionHas('message', 'Organization updated successfully!');

        $this->shippingAgencyOrg->refresh();
        expect($this->shippingAgencyOrg->name)->toBe('Updated Organization Name');
        expect($this->shippingAgencyOrg->registration_code)->toBe('UPD001');
        expect($this->shippingAgencyOrg->business_type)->toBe(OrganizationBusinessType::VESSEL_OWNER);
    });

    it('validates unique registration code on update', function (): void {
        $updateData = [
            'name' => 'Updated Name',
            'registration_code' => 'VO001', // Already exists on vesselOwnerOrg
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->patch(route('organizations.update', $this->shippingAgencyOrg), $updateData);

        $response->assertSessionHasErrors('registration_code');
    });

    it('allows keeping same registration code on update', function (): void {
        $updateData = [
            'name' => 'Updated Name',
            'registration_code' => 'SA001', // Same as current
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->patch(route('organizations.update', $this->shippingAgencyOrg), $updateData);

        $response->assertRedirect(route('organizations.index'));
        $response->assertSessionDoesntHaveErrors();
    });

    it('denies unauthorized users from updating', function (): void {
        $updateData = [
            'name' => 'Unauthorized Update',
            'registration_code' => 'HACK001',
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY->value,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('organizations.update', $this->shippingAgencyOrg), $updateData);

        $response->assertForbidden();
    });
});

describe('OrganizationController destroy', function (): void {
    it('allows authorized users to delete empty organization', function (): void {
        $emptyOrg = Organization::factory()->create([
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        ]);

        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.destroy', $emptyOrg));

        $response->assertRedirect(route('organizations.index'));
        $response->assertSessionHas('message', 'Organization deleted successfully!');

        $this->assertDatabaseMissing('organizations', ['id' => $emptyOrg->id]);
    });

    it('prevents deletion of organization with users', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.destroy', $this->shippingAgencyOrg));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Cannot delete organization with existing users. Please remove all users first.');

        $this->assertDatabaseHas('organizations', ['id' => $this->shippingAgencyOrg->id]);
    });

    it('prevents deletion of organization with vessels', function (): void {
        $orgWithVessel = Organization::factory()->create([
            'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        ]);

        Vessel::factory()->create(['organization_id' => $orgWithVessel->id]);

        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.destroy', $orgWithVessel));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Cannot delete organization with existing vessels. Please remove all vessels first.');
    });

    it('prevents deletion of organization with services', function (): void {
        $orgWithService = Organization::factory()->create([
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        ]);

        Service::factory()->create(['organization_id' => $orgWithService->id]);

        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.destroy', $orgWithService));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Cannot delete organization with existing services. Please remove all services first.');
    });

    it('denies unauthorized users from deleting organizations', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->delete(route('organizations.destroy', $this->shippingAgencyOrg));

        $response->assertForbidden();
    });
});

describe('OrganizationController member management', function (): void {
    it('allows adding member to organization', function (): void {
        $memberData = [
            'user_id' => $this->unattachedUser->id,
            'role' => UserRoles::VIEWER->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.members.add', $this->shippingAgencyOrg), $memberData);

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Member added successfully!');

        $this->assertDatabaseHas('organization_user', [
            'user_id' => $this->unattachedUser->id,
            'organization_id' => $this->shippingAgencyOrg->id,
            'role' => UserRoles::VIEWER->value,
        ]);
    });

    it('prevents adding duplicate member', function (): void {
        $memberData = [
            'user_id' => $this->shippingAgencyAdmin->id, // Already a member
            'role' => UserRoles::VIEWER->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.members.add', $this->shippingAgencyOrg), $memberData);

        $response->assertRedirect();
        $response->assertSessionHasErrors('user_id');
    });

    it('validates member addition data', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('organizations.members.add', $this->shippingAgencyOrg), []);

        $response->assertSessionHasErrors(['user_id', 'role']);
    });

    it('allows removing member from organization', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.members.remove', [
                'organization' => $this->shippingAgencyOrg,
                'user' => $this->shippingAgencyAdmin,
            ]));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Member removed successfully!');

        $this->assertDatabaseMissing('organization_user', [
            'user_id' => $this->shippingAgencyAdmin->id,
            'organization_id' => $this->shippingAgencyOrg->id,
        ]);
    });

    it('clears current_organization_id when removing current organization member', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.members.remove', [
                'organization' => $this->shippingAgencyOrg,
                'user' => $this->shippingAgencyAdmin,
            ]));

        $response->assertRedirect();

        $this->shippingAgencyAdmin->refresh();
        expect($this->shippingAgencyAdmin->current_organization_id)->toBeNull();
    });

    it('handles removing non-member gracefully', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('organizations.members.remove', [
                'organization' => $this->shippingAgencyOrg,
                'user' => $this->unattachedUser,
            ]));

        $response->assertRedirect();
        $response->assertSessionHasErrors('error');
    });

    it('allows updating member role', function (): void {
        $roleData = [
            'role' => UserRoles::ADMIN->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->put(route('organizations.members.role.update', [
                'organization' => $this->shippingAgencyOrg,
                'user' => $this->shippingAgencyAdmin,
            ]), $roleData);

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Member role updated successfully!');

        $this->assertDatabaseHas('organization_user', [
            'user_id' => $this->shippingAgencyAdmin->id,
            'organization_id' => $this->shippingAgencyOrg->id,
            'role' => UserRoles::ADMIN->value,
        ]);
    });

    it('validates role update data', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->put(route('organizations.members.role.update', [
                'organization' => $this->shippingAgencyOrg,
                'user' => $this->shippingAgencyAdmin,
            ]), ['role' => 'invalid_role']);

        $response->assertSessionHasErrors('role');
    });

    it('handles updating role for non-member', function (): void {
        $roleData = [
            'role' => UserRoles::ADMIN->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->put(route('organizations.members.role.update', [
                'organization' => $this->shippingAgencyOrg,
                'user' => $this->unattachedUser,
            ]), $roleData);

        $response->assertRedirect();
        $response->assertSessionHasErrors('error');
    });

    it('denies unauthorized users from managing members', function (): void {
        $memberData = [
            'user_id' => $this->unattachedUser->id,
            'role' => UserRoles::VIEWER->value,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('organizations.members.add', $this->shippingAgencyOrg), $memberData);

        $response->assertForbidden();
    });
});
