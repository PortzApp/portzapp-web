<?php

use App\Enums\OrderGroupStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderGroupService;
use App\Models\Organization;
use App\Models\Port;
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
    ]);

    $this->shippingAgencyOrg2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Another Shipping Agency',
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

    $this->shippingAgencyViewer = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyViewer->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::VIEWER]);

    $this->shippingAgency2Admin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg2->id]);
    $this->shippingAgency2Admin->organizations()->attach($this->shippingAgencyOrg2, ['role' => UserRoles::ADMIN]);

    $this->vesselOwnerAdmin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN]);

    // Create test data
    $this->port = Port::factory()->create();
    $this->vessel = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg->id]);

    $this->order = Order::factory()->create([
        'vessel_id' => $this->vessel->id,
        'port_id' => $this->port->id,
        'placed_by_user_id' => $this->vesselOwnerAdmin->id,
        'placed_by_organization_id' => $this->vesselOwnerOrg->id,
    ]);

    $this->orderGroup = OrderGroup::factory()->create([
        'order_id' => $this->order->id,
        'fulfilling_organization_id' => $this->shippingAgencyOrg->id,
        'status' => OrderGroupStatus::PENDING,
    ]);

    $this->orderGroup2 = OrderGroup::factory()->create([
        'order_id' => $this->order->id,
        'fulfilling_organization_id' => $this->shippingAgencyOrg2->id,
        'status' => OrderGroupStatus::PENDING,
    ]);

    $this->service = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg->id,
        'port_id' => $this->port->id,
    ]);

    OrderGroupService::create([
        'order_group_id' => $this->orderGroup->id,
        'service_id' => $this->service->id,
        'status' => 'pending',
        'price_snapshot' => $this->service->price,
        'notes' => null,
    ]);
});

describe('OrderGroupController index', function (): void {
    it('allows PORTZAPP_TEAM to view all order groups', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('order-groups.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('order-groups/order-groups-index-page')
            ->has('orderGroups', 2) // Should see both order groups
        );
    });

    it('allows SHIPPING_AGENCY admin to view only their order groups', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('order-groups.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('order-groups/order-groups-index-page')
            ->has('orderGroups', 1) // Should only see their order group
            ->where('orderGroups.0.id', $this->orderGroup->id)
        );
    });

    it('allows SHIPPING_AGENCY viewer to view only their order groups', function (): void {
        $response = $this->actingAs($this->shippingAgencyViewer)
            ->get(route('order-groups.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('order-groups/order-groups-index-page')
            ->has('orderGroups', 1)
        );
    });

    it('forbids VESSEL_OWNER from accessing order groups index', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-groups.index'));

        $response->assertForbidden();
    });

    it('redirects unauthenticated users to login', function (): void {
        $response = $this->get(route('order-groups.index'));

        $response->assertRedirect(route('login'));
    });

    it('loads correct relationships', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('order-groups.index'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('orderGroups.0.order.vessel')
            ->has('orderGroups.0.order.port')
            ->has('orderGroups.0.fulfilling_organization')
            ->has('orderGroups.0.order_group_services')
            ->has('orderGroups.0.order_group_services.0.service')
        );
    });
});

describe('OrderGroupController show', function (): void {
    it('allows PORTZAPP_TEAM to view any order group', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('order-groups.show', $this->orderGroup));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('order-groups/show-order-group-page')
            ->has('orderGroup')
            ->has('parentOrder')
            ->has('siblingOrderGroups')
        );
    });

    it('allows SHIPPING_AGENCY to view their own order group', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('order-groups.show', $this->orderGroup));

        $response->assertSuccessful();
    });

    it('forbids SHIPPING_AGENCY from viewing other organizations order groups', function (): void {
        $response = $this->actingAs($this->shippingAgency2Admin)
            ->get(route('order-groups.show', $this->orderGroup));

        $response->assertForbidden();
    });

    it('loads sibling order groups correctly', function (): void {
        $response = $this->actingAs($this->portzappAdmin)
            ->get(route('order-groups.show', $this->orderGroup));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->has('siblingOrderGroups', 1) // Should have 1 sibling
            ->where('siblingOrderGroups.0.id', $this->orderGroup2->id)
        );
    });

    it('forbids VESSEL_OWNER from viewing order groups', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-groups.show', $this->orderGroup));

        $response->assertForbidden();
    });
});

describe('OrderGroupController update', function (): void {
    it('allows authorized users to update order group', function (): void {
        $updateData = [
            'status' => OrderGroupStatus::ACCEPTED->value,
            'notes' => 'Updated notes',
        ];

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->patch(route('order-groups.update', $this->orderGroup), $updateData);

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Order group updated successfully!');

        $this->orderGroup->refresh();
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::ACCEPTED);
        expect($this->orderGroup->notes)->toBe('Updated notes');
    });

    it('forbids unauthorized users from updating order group', function (): void {
        $updateData = [
            'status' => OrderGroupStatus::ACCEPTED->value,
        ];

        $response = $this->actingAs($this->shippingAgency2Admin)
            ->patch(route('order-groups.update', $this->orderGroup), $updateData);

        $response->assertForbidden();
    });

    it('validates update data', function (): void {
        $invalidData = [
            'status' => 'invalid_status',
        ];

        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->patch(route('order-groups.update', $this->orderGroup), $invalidData);

        $response->assertSessionHasErrors('status');
    });
});

describe('OrderGroupController status transitions', function (): void {
    it('allows authorized user to accept order group', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('order-groups.accept', $this->orderGroup));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Order group accepted successfully!');

        $this->orderGroup->refresh();
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::ACCEPTED);
    });

    it('allows authorized user to reject order group', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('order-groups.reject', $this->orderGroup));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Order group rejected!');

        $this->orderGroup->refresh();
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::REJECTED);
    });

    it('allows authorized user to start order group', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('order-groups.start', $this->orderGroup));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Order group started!');

        $this->orderGroup->refresh();
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::IN_PROGRESS);
    });

    it('allows authorized user to complete order group', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('order-groups.complete', $this->orderGroup));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Order group completed!');

        $this->orderGroup->refresh();
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::COMPLETED);
    });

    it('forbids unauthorized users from changing status', function (): void {
        $response = $this->actingAs($this->shippingAgency2Admin)
            ->post(route('order-groups.accept', $this->orderGroup));

        $response->assertForbidden();

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-groups.reject', $this->orderGroup));

        $response->assertForbidden();
    });

    it('forbids PORTZAPP_TEAM viewer from changing status', function (): void {
        $response = $this->actingAs($this->portzappViewer)
            ->post(route('order-groups.accept', $this->orderGroup));

        $response->assertForbidden();
    });
});

describe('OrderGroupController authorization edge cases', function (): void {
    it('handles unauthenticated requests properly', function (): void {
        $routes = [
            ['GET', route('order-groups.index')],
            ['GET', route('order-groups.show', $this->orderGroup)],
            ['PATCH', route('order-groups.update', $this->orderGroup)],
            ['POST', route('order-groups.accept', $this->orderGroup)],
            ['POST', route('order-groups.reject', $this->orderGroup)],
        ];

        foreach ($routes as [$method, $url]) {
            $response = $this->call($method, $url);
            $response->assertRedirect(route('login'));
        }
    });

    it('handles users without current organization', function (): void {
        $userWithoutOrg = User::factory()->create(['current_organization_id' => null]);

        $response = $this->actingAs($userWithoutOrg)
            ->get(route('order-groups.index'));

        $response->assertForbidden();
    });
});
