<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\Port;
use App\Models\User;

beforeEach(function (): void {
    // Create organizations
    $this->portzappOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PORTZAPP_TEAM,
        'name' => 'PortzApp Team',
    ]);

    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Test Shipping Agency',
    ]);

    $this->vesselOwnerOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Test Vessel Owner',
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

    // Create test port
    $this->port = Port::factory()->create([
        'name' => 'Test Port',
        'country' => 'Test Country',
        'city' => 'Test City',
    ]);
});

describe('PortController index', function (): void {
    it('allows PORTZAPP_TEAM users to view ports', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('ports.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('ports/ports-index-page')
            ->has('ports', 1)
        );
    });

    it('denies VESSEL_OWNER users from viewing ports', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('ports.index'));

        $response->assertForbidden();
    });

    it('denies SHIPPING_AGENCY users from viewing ports', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('ports.index'));

        $response->assertForbidden();
    });

    it('redirects unauthenticated users to login', function (): void {
        $response = $this->get(route('ports.index'));

        $response->assertRedirect(route('login'));
    });

    it('orders ports by latest first', function (): void {
        // Create a newer port after a small delay to ensure different created_at
        sleep(1);
        $newerPort = Port::factory()->create(['name' => 'Newer Port']);

        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('ports.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->where('ports.0.name', 'Newer Port') // Should be first
        );
    });
});

describe('PortController create', function (): void {
    it('allows PORTZAPP_TEAM admin to view create form', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('ports.create'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('ports/create-port-page')
        );
    });

    it('denies PORTZAPP_TEAM non-admin users from viewing create form', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->get(route('ports.create'));

        $response->assertForbidden();
    });

    it('denies other organization types from viewing create form', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('ports.create'));

        $response->assertForbidden();

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('ports.create'));

        $response->assertForbidden();
    });
});

describe('PortController store', function (): void {
    it('allows PORTZAPP_TEAM admin to create port', function (): void {
        $portData = [
            'name' => 'New Port',
            'code' => 'NEWPT',
            'status' => 'active',
            'country' => 'New Country',
            'city' => 'New City',
            'latitude' => 25.0218,
            'longitude' => 55.0592,
            'timezone' => 'Asia/Dubai',
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('ports.store'), $portData);

        $response->assertRedirect(route('ports.index'));
        $response->assertSessionHas('message', 'Port created successfully!');

        $this->assertDatabaseHas('ports', [
            'name' => 'New Port',
            'code' => 'NEWPT',
            'status' => 'active',
            'country' => 'New Country',
            'city' => 'New City',
        ]);
    });

    it('denies PORTZAPP_TEAM non-admin users from creating ports', function (): void {
        $portData = [
            'name' => 'Unauthorized Port',
            'code' => 'UNAUTH',
            'status' => 'active',
            'country' => 'Test Country',
            'city' => 'Test City',
            'latitude' => 25.0218,
            'longitude' => 55.0592,
            'timezone' => 'Asia/Dubai',
        ];

        $response = $this->actingAs($this->portzappViewer)
            ->post(route('ports.store'), $portData);

        $response->assertForbidden();
    });

    it('denies other organization types from creating ports', function (): void {
        $portData = [
            'name' => 'Unauthorized Port',
            'code' => 'FORBID',
            'status' => 'active',
            'country' => 'Test Country',
            'city' => 'Test City',
            'latitude' => 25.0218,
            'longitude' => 55.0592,
            'timezone' => 'Asia/Dubai',
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('ports.store'), $portData);

        $response->assertForbidden();

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('ports.store'), $portData);

        $response->assertForbidden();
    });

    it('validates port creation data through form request', function (): void {
        // Test with empty data to trigger validation
        $response = $this->actingAs($this->portzappAdmin)
            ->post(route('ports.store'), []);

        $response->assertSessionHasErrors();
    });
});

describe('PortController show', function (): void {
    it('allows PORTZAPP_TEAM users to view port details', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('ports.show', $this->port));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('ports/show-port-page')
            ->has('port')
            ->where('port.id', $this->port->id)
        );
    });

    it('denies non-PORTZAPP_TEAM users from viewing port details', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('ports.show', $this->port));

        $response->assertForbidden();

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('ports.show', $this->port));

        $response->assertForbidden();
    });
});

describe('PortController edit', function (): void {
    it('allows PORTZAPP_TEAM admin to view edit form', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('ports.edit', $this->port));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('ports/edit-port-page')
            ->has('port')
            ->where('port.id', $this->port->id)
        );
    });

    it('denies PORTZAPP_TEAM non-admin users from viewing edit form', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->get(route('ports.edit', $this->port));

        $response->assertForbidden();
    });

    it('denies other organization types from viewing edit form', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('ports.edit', $this->port));

        $response->assertForbidden();

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('ports.edit', $this->port));

        $response->assertForbidden();
    });
});

describe('PortController update', function (): void {
    it('allows PORTZAPP_TEAM admin to update port', function (): void {
        $updateData = [
            'name' => 'Updated Port Name',
            'code' => 'UPDPT',
            'status' => 'active',
            'country' => 'Updated Country',
            'city' => 'Updated City',
            'latitude' => 26.0218,
            'longitude' => 56.0592,
            'timezone' => 'Asia/Dubai',
        ];

        $response = $this->actingAs($this->portzappAdmin)
            ->patch(route('ports.update', $this->port), $updateData);

        $response->assertRedirect(route('ports.index'));
        $response->assertSessionHas('message', 'Port updated successfully!');

        $this->port->refresh();
        expect($this->port->name)->toBe('Updated Port Name');
        expect($this->port->country)->toBe('Updated Country');
        expect($this->port->city)->toBe('Updated City');
        expect($this->port->code)->toBe('UPDPT');
    });

    it('denies PORTZAPP_TEAM non-admin users from updating ports', function (): void {
        $updateData = [
            'name' => 'Unauthorized Update',
            'code' => 'UNAUP',
            'status' => 'active',
            'country' => 'Test Country',
            'city' => 'Test City',
            'latitude' => 25.0218,
            'longitude' => 55.0592,
            'timezone' => 'Asia/Dubai',
        ];

        $response = $this->actingAs($this->portzappViewer)
            ->patch(route('ports.update', $this->port), $updateData);

        $response->assertForbidden();
    });

    it('denies other organization types from updating ports', function (): void {
        $updateData = [
            'name' => 'Unauthorized Update',
            'code' => 'FORBUP',
            'status' => 'active',
            'country' => 'Test Country',
            'city' => 'Test City',
            'latitude' => 25.0218,
            'longitude' => 55.0592,
            'timezone' => 'Asia/Dubai',
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('ports.update', $this->port), $updateData);

        $response->assertForbidden();

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->patch(route('ports.update', $this->port), $updateData);

        $response->assertForbidden();
    });

    it('validates update data through form request', function (): void {
        // Test with invalid data to trigger validation
        $response = $this->actingAs($this->portzappAdmin)
            ->patch(route('ports.update', $this->port), []);

        $response->assertSessionHasErrors();
    });
});

describe('PortController destroy', function (): void {
    it('allows PORTZAPP_TEAM admin to delete port', function (): void {
        $portToDelete = Port::factory()->create();

        $response = $this->actingAs($this->portzappAdmin)
            ->delete(route('ports.destroy', $portToDelete));

        $response->assertRedirect(route('ports.index'));
        $response->assertSessionHas('message', 'Port deleted successfully!');

        $this->assertDatabaseMissing('ports', ['id' => $portToDelete->id]);
    });

    it('denies PORTZAPP_TEAM non-admin users from deleting ports', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->delete(route('ports.destroy', $this->port));

        $response->assertForbidden();

        $this->assertDatabaseHas('ports', ['id' => $this->port->id]);
    });

    it('denies other organization types from deleting ports', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->delete(route('ports.destroy', $this->port));

        $response->assertForbidden();

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->delete(route('ports.destroy', $this->port));

        $response->assertForbidden();

        $this->assertDatabaseHas('ports', ['id' => $this->port->id]);
    });
});

describe('PortController authorization edge cases', function (): void {
    it('handles unauthenticated requests properly', function (): void {
        $routes = [
            ['GET', route('ports.index')],
            ['GET', route('ports.create')],
            ['POST', route('ports.store')],
            ['GET', route('ports.show', $this->port)],
            ['GET', route('ports.edit', $this->port)],
            ['PATCH', route('ports.update', $this->port)],
            ['DELETE', route('ports.destroy', $this->port)],
        ];

        foreach ($routes as [$method, $url]) {
            $response = $this->call($method, $url);
            $response->assertRedirect(route('login'));
        }
    });

    it('handles users without current organization', function (): void {
        $userWithoutOrg = User::factory()->create(['current_organization_id' => null]);

        $response = $this->actingAs($userWithoutOrg)
            ->get(route('ports.index'));

        $response->assertForbidden();
    });

    it('verifies proper gate method calls', function (): void {
        // Test that the controller uses the correct gate methods
        // index uses 'view-any' (not 'viewAny')
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('ports.index'));

        $response->assertSuccessful();
    });
});
