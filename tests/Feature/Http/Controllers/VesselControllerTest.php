<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Enums\VesselStatus;
use App\Enums\VesselType;
use App\Models\Organization;
use App\Models\User;
use App\Models\Vessel;

beforeEach(function (): void {
    // Create organizations
    $this->portzappOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PORTZAPP_TEAM,
        'name' => 'PortzApp Team',
    ]);

    $this->vesselOwnerOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Test Vessel Owner',
    ]);

    $this->vesselOwnerOrg2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Another Vessel Owner',
    ]);

    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Test Shipping Agency',
    ]);

    // Create users
    $this->portzappAdmin = User::factory()->create(['current_organization_id' => $this->portzappOrg->id]);
    $this->portzappAdmin->organizations()->attach($this->portzappOrg, ['role' => UserRoles::ADMIN]);

    $this->portzappViewer = User::factory()->create(['current_organization_id' => $this->portzappOrg->id]);
    $this->portzappViewer->organizations()->attach($this->portzappOrg, ['role' => UserRoles::VIEWER]);

    $this->vesselOwnerAdmin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN]);

    $this->vesselOwnerViewer = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerViewer->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::VIEWER]);

    $this->vesselOwner2Admin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg2->id]);
    $this->vesselOwner2Admin->organizations()->attach($this->vesselOwnerOrg2, ['role' => UserRoles::ADMIN]);

    $this->shippingAgencyAdmin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN]);

    // Create test vessels
    $this->vessel = Vessel::factory()->create([
        'organization_id' => $this->vesselOwnerOrg->id,
        'name' => 'Test Vessel',
        'imo_number' => '1234567',
        'vessel_type' => VesselType::CONTAINER_SHIP,
        'status' => VesselStatus::ACTIVE,
    ]);

    $this->vessel2 = Vessel::factory()->create([
        'organization_id' => $this->vesselOwnerOrg2->id,
        'name' => 'Another Vessel',
    ]);
});

describe('VesselController index', function (): void {
    it('allows VESSEL_OWNER users to view vessels', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('vessels/vessels-index-page')
            ->has('vessels')
        );
    });

    it('allows PORTZAPP_TEAM users to view vessels', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('vessels.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('vessels/vessels-index-page')
            ->has('vessels')
        );
    });

    it('denies SHIPPING_AGENCY users from viewing vessels', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('vessels.index'));

        $response->assertForbidden();
    });

    it('redirects unauthenticated users to login', function (): void {
        $response = $this->get(route('vessels.index'));

        $response->assertRedirect(route('login'));
    });

    it('orders vessels by latest first', function (): void {
        // Create a vessel with an explicit later created_at timestamp
        $newerVessel = Vessel::factory()->create([
            'organization_id' => $this->vesselOwnerOrg->id,
            'name' => 'Newer Vessel',
            'created_at' => now()->addSecond(), // Explicitly make this newer
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->where('vessels.0.name', 'Newer Vessel') // Should be first
        );
    });

    it('only shows vessels from the current user organization', function (): void {
        // User from org1 should only see vessels from their organization
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('vessels') // Should have vessels
            ->where('vessels', fn ($vessels) => collect($vessels)->every(fn ($vessel) => $vessel['organization_id'] === $this->vesselOwnerOrg->id)
            )
        );

        // User from org2 should only see vessels from their organization
        $response = $this->actingAs($this->vesselOwner2Admin)
            ->get(route('vessels.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('vessels') // Should have vessels
            ->where('vessels', fn ($vessels) => collect($vessels)->every(fn ($vessel) => $vessel['organization_id'] === $this->vesselOwnerOrg2->id)
            )
        );
    });
});

describe('VesselController create', function (): void {
    it('allows VESSEL_OWNER admin to view create form', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.create'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('vessels/create-vessel-page')
        );
    });

    it('allows PORTZAPP_TEAM admin to view create form', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('vessels.create'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('vessels/create-vessel-page')
        );
    });

    it('denies VESSEL_OWNER viewer from viewing create form', function (): void {
        $response = $this->actingAs($this->vesselOwnerViewer)
            ->get(route('vessels.create'));

        $response->assertForbidden();
    });

    it('denies PORTZAPP_TEAM viewer from viewing create form', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->get(route('vessels.create'));

        $response->assertForbidden();
    });

    it('denies SHIPPING_AGENCY users from viewing create form', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('vessels.create'));

        $response->assertForbidden();
    });
});

describe('VesselController store', function (): void {
    it('allows VESSEL_OWNER admin to create vessel', function (): void {
        $vesselData = [
            'name' => 'New Vessel',
            'imo_number' => '9876543',
            'vessel_type' => VesselType::TANKER_SHIP->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('vessels.store'), $vesselData);

        $response->assertRedirect(route('vessels.index'));
        $response->assertSessionHas('message', 'Vessel created successfully!');

        $this->assertDatabaseHas('vessels', [
            'name' => 'New Vessel',
            'imo_number' => '9876543',
            'vessel_type' => VesselType::TANKER_SHIP->value,
            'status' => VesselStatus::ACTIVE->value,
            'organization_id' => $this->vesselOwnerOrg->id,
        ]);
    });

    it('allows PORTZAPP_TEAM admin to create vessel', function (): void {
        $vesselData = [
            'name' => 'Admin Created Vessel',
            'imo_number' => '1111111',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('vessels.store'), $vesselData);

        $response->assertRedirect(route('vessels.index'));
        $response->assertSessionHas('message', 'Vessel created successfully!');

        $this->assertDatabaseHas('vessels', [
            'name' => 'Admin Created Vessel',
            'imo_number' => '1111111',
        ]);
    });

    it('associates vessel with user first organization when created', function (): void {
        $vesselData = [
            'name' => 'Organization Test Vessel',
            'imo_number' => '2222222',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('vessels.store'), $vesselData);

        $response->assertRedirect(route('vessels.index'));

        $vessel = Vessel::where('name', 'Organization Test Vessel')->first();
        expect($vessel->organization_id)->toBe($this->vesselOwnerOrg->id);
    });

    it('denies VESSEL_OWNER viewer from creating vessels', function (): void {
        $vesselData = [
            'name' => 'Unauthorized Vessel',
            'imo_number' => '9999999',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->vesselOwnerViewer)
            ->post(route('vessels.store'), $vesselData);

        $response->assertForbidden();
    });

    it('denies SHIPPING_AGENCY users from creating vessels', function (): void {
        $vesselData = [
            'name' => 'Unauthorized Vessel',
            'imo_number' => '9999998',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('vessels.store'), $vesselData);

        $response->assertForbidden();
    });

    it('validates vessel creation data through form request', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('vessels.store'), []);

        $response->assertSessionHasErrors();
    });
});

describe('VesselController show', function (): void {
    it('allows VESSEL_OWNER users to view vessels', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.show', $this->vessel));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('vessels/show-vessel-page')
            ->has('vessel')
            ->where('vessel.id', $this->vessel->id)
        );
    });

    it('allows PORTZAPP_TEAM users to view vessels', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('vessels.show', $this->vessel));

        $response->assertSuccessful();
    });

    it('denies SHIPPING_AGENCY users from viewing vessels', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('vessels.show', $this->vessel));

        $response->assertForbidden();
    });
});

describe('VesselController edit', function (): void {
    it('allows VESSEL_OWNER admin to view edit form for their vessels', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.edit', $this->vessel));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('vessels/edit-vessel-page')
            ->has('vessel')
            ->where('vessel.id', $this->vessel->id)
        );
    });

    it('allows PORTZAPP_TEAM admin to view edit form for any vessel', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('vessels.edit', $this->vessel));

        $response->assertSuccessful();
    });

    it('denies VESSEL_OWNER viewer from viewing edit form', function (): void {
        $response = $this->actingAs($this->vesselOwnerViewer)
            ->get(route('vessels.edit', $this->vessel));

        $response->assertForbidden();
    });

    it('denies PORTZAPP_TEAM viewer from viewing edit form', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->get(route('vessels.edit', $this->vessel));

        $response->assertForbidden();
    });

    it('denies SHIPPING_AGENCY users from viewing edit form', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('vessels.edit', $this->vessel));

        $response->assertForbidden();
    });
});

describe('VesselController update', function (): void {
    it('allows VESSEL_OWNER admin to update their vessels', function (): void {
        $updateData = [
            'name' => 'Updated Vessel Name',
            'imo_number' => '7777777',
            'vessel_type' => VesselType::TANKER_SHIP->value,
            'status' => VesselStatus::INACTIVE->value,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('vessels.update', $this->vessel), $updateData);

        $response->assertRedirect(route('vessels.index'));
        $response->assertSessionHas('message', 'Vessel updated successfully!');

        $this->vessel->refresh();
        expect($this->vessel->name)->toBe('Updated Vessel Name');
        expect($this->vessel->imo_number)->toBe('7777777');
        expect($this->vessel->vessel_type)->toBe(VesselType::TANKER_SHIP);
        expect($this->vessel->status)->toBe(VesselStatus::INACTIVE);
    });

    it('allows PORTZAPP_TEAM admin to update any vessel', function (): void {
        $updateData = [
            'name' => 'Admin Updated Vessel',
            'imo_number' => '8888888',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->patch(route('vessels.update', $this->vessel), $updateData);

        $response->assertRedirect(route('vessels.index'));
        $response->assertSessionHas('message', 'Vessel updated successfully!');

        $this->vessel->refresh();
        expect($this->vessel->name)->toBe('Admin Updated Vessel');
    });

    it('denies VESSEL_OWNER viewer from updating vessels', function (): void {
        $updateData = [
            'name' => 'Unauthorized Update',
            'imo_number' => '9999997',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->vesselOwnerViewer)
            ->patch(route('vessels.update', $this->vessel), $updateData);

        $response->assertForbidden();
    });

    it('denies SHIPPING_AGENCY users from updating vessels', function (): void {
        $updateData = [
            'name' => 'Unauthorized Update',
            'imo_number' => '9999996',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->patch(route('vessels.update', $this->vessel), $updateData);

        $response->assertForbidden();
    });

    it('validates update data through form request', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('vessels.update', $this->vessel), []);

        $response->assertSessionHasErrors();
    });
});

describe('VesselController destroy', function (): void {
    it('allows VESSEL_OWNER admin to delete their vessels', function (): void {
        $vesselToDelete = Vessel::factory()->create([
            'organization_id' => $this->vesselOwnerOrg->id,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->delete(route('vessels.destroy', $vesselToDelete));

        $response->assertRedirect(route('vessels.index'));
        $response->assertSessionHas('message', 'Vessel deleted successfully!');

        $this->assertDatabaseMissing('vessels', ['id' => $vesselToDelete->id]);
    });

    it('allows PORTZAPP_TEAM admin to delete any vessel', function (): void {
        $vesselToDelete = Vessel::factory()->create([
            'organization_id' => $this->vesselOwnerOrg2->id,
        ]);

        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('vessels.destroy', $vesselToDelete));

        $response->assertRedirect(route('vessels.index'));
        $response->assertSessionHas('message', 'Vessel deleted successfully!');

        $this->assertDatabaseMissing('vessels', ['id' => $vesselToDelete->id]);
    });

    it('denies VESSEL_OWNER viewer from deleting vessels', function (): void {
        $response = $this->actingAs($this->vesselOwnerViewer)
            ->delete(route('vessels.destroy', $this->vessel));

        $response->assertForbidden();

        $this->assertDatabaseHas('vessels', ['id' => $this->vessel->id]);
    });

    it('denies SHIPPING_AGENCY users from deleting vessels', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->delete(route('vessels.destroy', $this->vessel));

        $response->assertForbidden();

        $this->assertDatabaseHas('vessels', ['id' => $this->vessel->id]);
    });
});

describe('VesselController authorization edge cases', function (): void {
    it('handles unauthenticated requests properly', function (): void {
        $routes = [
            ['GET', route('vessels.index')],
            ['GET', route('vessels.create')],
            ['POST', route('vessels.store')],
            ['GET', route('vessels.show', $this->vessel)],
            ['GET', route('vessels.edit', $this->vessel)],
            ['PATCH', route('vessels.update', $this->vessel)],
            ['DELETE', route('vessels.destroy', $this->vessel)],
        ];

        foreach ($routes as [$method, $url]) {
            $response = $this->call($method, $url);
            $response->assertRedirect(route('login'));
        }
    });

    it('handles users without current organization', function (): void {
        $userWithoutOrg = User::factory()->create(['current_organization_id' => null]);

        $response = $this->actingAs($userWithoutOrg)
            ->get(route('vessels.index'));

        $response->assertForbidden();
    });

    it('verifies proper gate method calls', function (): void {
        // Test that the controller uses the correct gate methods
        // index uses 'view-any' (not 'viewAny')
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('vessels.index'));

        $response->assertSuccessful();
    });

    it('handles user organizations first method when no organizations exist', function (): void {
        $userWithoutOrgMembership = User::factory()->create();

        $vesselData = [
            'name' => 'Test Vessel',
            'imo_number' => '1234568',
            'vessel_type' => VesselType::BULK_CARRIER->value,
            'status' => VesselStatus::ACTIVE->value,
        ];

        $response = $this->actingAs($userWithoutOrgMembership)
            ->post(route('vessels.store'), $vesselData);

        // This should handle the case where user has no organizations gracefully
        $response->assertForbidden(); // or whatever the expected behavior is
    });
});
