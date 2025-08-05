<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Service;
use App\Models\User;
use App\Models\Vessel;

beforeEach(function (): void {
    // Create organizations
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

    $this->shippingAgencyOrg2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Another Shipping Agency',
    ]);

    $this->platformAdminOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PLATFORM_ADMIN,
        'name' => 'PortzApp Admin',
    ]);

    // Create users
    $this->vesselOwnerAdmin = User::factory()->create();
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $this->vesselOwnerMember = User::factory()->create();
    $this->vesselOwnerMember->organizations()->attach($this->vesselOwnerOrg, [
        'role' => UserRoles::MEMBER->value,
    ]);

    $this->shippingAgencyAdmin = User::factory()->create();
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $this->shippingAgencyMember = User::factory()->create();
    $this->shippingAgencyMember->organizations()->attach($this->shippingAgencyOrg, [
        'role' => UserRoles::MEMBER->value,
    ]);

    $this->platformAdmin = User::factory()->create();
    $this->platformAdmin->organizations()->attach($this->platformAdminOrg, [
        'role' => UserRoles::ADMIN->value,
    ]);

    // Create vessels
    $this->vessel = Vessel::factory()->create([
        'organization_id' => $this->vesselOwnerOrg->id,
        'name' => 'Test Vessel 1',
        'imo_number' => '1234567',
    ]);

    $this->vessel2 = Vessel::factory()->create([
        'organization_id' => $this->vesselOwnerOrg2->id,
        'name' => 'Test Vessel 2',
        'imo_number' => '7654321',
    ]);

    // Create services
    $this->service = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg->id,
        'name' => 'Port Agency Services',
        'description' => 'Professional port services',
        'price' => 5000.00,
        'status' => ServiceStatus::ACTIVE,
    ]);

    $this->serviceFromOtherOrg = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg2->id,
        'name' => 'Cargo Handling',
        'description' => 'Expert cargo handling services',
        'price' => 3000.00,
        'status' => ServiceStatus::ACTIVE,
    ]);

    // Create orders
    $this->order = Order::factory()->create([
        'vessel_id' => $this->vessel->id,
        'requesting_organization_id' => $this->vesselOwnerOrg->id,
        'providing_organization_id' => $this->shippingAgencyOrg->id,
        'price' => 5000.00,
        'status' => 'pending',
        'notes' => 'Test order',
    ]);
    // Attach the service via pivot table
    $this->order->services()->attach($this->service->id);

    $this->orderFromOtherOrgs = Order::factory()->create([
        'vessel_id' => $this->vessel2->id,
        'requesting_organization_id' => $this->vesselOwnerOrg2->id,
        'providing_organization_id' => $this->shippingAgencyOrg2->id,
        'price' => 3000.00,
        'status' => 'accepted',
        'notes' => 'Another test order',
    ]);
    // Attach the service via pivot table
    $this->orderFromOtherOrgs->services()->attach($this->serviceFromOtherOrg->id);
});

test('vessel owner admin can view orders index', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('orders'));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 1)
        ->where('orders.0.id', $this->order->id)
    );
});

test('vessel owner member can view orders index', function (): void {
    $response = $this->actingAs($this->vesselOwnerMember)
        ->get(route('orders'));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 1)
    );
});

test('shipping agency admin can view orders index', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('orders'));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 1)
        ->where('orders.0.id', $this->order->id)
    );
});

test('shipping agency member can view orders index', function (): void {
    $response = $this->actingAs($this->shippingAgencyMember)
        ->get(route('orders'));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 1)
    );
});

test('platform admin can view all orders', function (): void {
    $response = $this->actingAs($this->platformAdmin)
        ->get(route('orders'));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 2) // Should see both orders
    );
});

test('orders are filtered by user organization involvement', function (): void {
    // Create a user in the second vessel owner org
    $userInSecondOrg = User::factory()->create();
    $userInSecondOrg->organizations()->attach($this->vesselOwnerOrg2, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $response = $this->actingAs($userInSecondOrg)
        ->get(route('orders'));

    $response->assertStatus(200);

    // Should only see orders from their organization
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 1)
        ->where('orders.0.id', $this->orderFromOtherOrgs->id)
    );
});

test('vessel owner admin can create order', function (): void {
    $orderData = [
        'service_id' => $this->service->id,
        'vessel_id' => $this->vessel->id,
        'notes' => 'New test order',
    ];

    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->post(route('orders.store'), $orderData);

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order created successfully!');

    $this->assertDatabaseHas('orders', [
        'requesting_organization_id' => $this->vesselOwnerOrg->id,
        'providing_organization_id' => $this->shippingAgencyOrg->id,
        'notes' => 'New test order',
    ]);

    // Check that the service is attached via pivot table
    $newOrder = Order::where('notes', 'New test order')->first();
    expect($newOrder->services)->toHaveCount(1);
    expect($newOrder->services->first()->id)->toBe($this->service->id);
});

test('vessel owner member can create order', function (): void {
    $orderData = [
        'service_id' => $this->service->id,
        'vessel_id' => $this->vessel->id,
        'notes' => 'Member created order',
    ];

    $response = $this->actingAs($this->vesselOwnerMember)
        ->post(route('orders.store'), $orderData);

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order created successfully!');

    $this->assertDatabaseHas('orders', [
        'requesting_organization_id' => $this->vesselOwnerOrg->id,
        'providing_organization_id' => $this->shippingAgencyOrg->id,
        'notes' => 'Member created order',
    ]);

    // Check that the service is attached via pivot table
    $newOrder = Order::where('notes', 'Member created order')->first();
    expect($newOrder->services)->toHaveCount(1);
    expect($newOrder->services->first()->id)->toBe($this->service->id);
});

test('shipping agency user cannot create order', function (): void {
    $orderData = [
        'service_id' => $this->service->id,
        'vessel_id' => $this->vessel->id,
        'notes' => 'Unauthorized order',
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->post(route('orders.store'), $orderData);

    $response->assertStatus(403);
    $this->assertDatabaseMissing('orders', [
        'notes' => 'Unauthorized order',
    ]);
});

test('user without vessel owner org cannot create order', function (): void {
    $userWithoutOrg = User::factory()->create();

    $orderData = [
        'service_id' => $this->service->id,
        'vessel_id' => $this->vessel->id,
        'notes' => 'Unauthorized order',
    ];

    $response = $this->actingAs($userWithoutOrg)
        ->post(route('orders.store'), $orderData);

    $response->assertStatus(403);
});

test('vessel owner admin can view own order details', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('orders.show', $this->order));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/show')
        ->where('order.id', $this->order->id)
    );
});

test('shipping agency admin can view order details for their services', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('orders.show', $this->order));

    $response->assertStatus(200);
    $response->assertInertia(fn($page) => $page->component('orders/show')
        ->where('order.id', $this->order->id)
    );
});

test('user cannot view order from different organizations', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('orders.show', $this->orderFromOtherOrgs));

    $response->assertStatus(403);
});

test('vessel owner admin can update own order', function (): void {
    $updateData = [
        'notes' => 'Updated order notes',
        'status' => 'accepted',
    ];

    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->put(route('orders.update', $this->order), $updateData);

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order updated successfully!');

    $this->assertDatabaseHas('orders', [
        'id' => $this->order->id,
        'notes' => 'Updated order notes',
    ]);
});

test('vessel owner member can update own order', function (): void {
    $updateData = [
        'notes' => 'Member updated notes',
        'status' => 'pending', // Keep the same status but include it for validation
    ];

    $response = $this->actingAs($this->vesselOwnerMember)
        ->put(route('orders.update', $this->order), $updateData);

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order updated successfully!');

    $this->assertDatabaseHas('orders', [
        'id' => $this->order->id,
        'notes' => 'Member updated notes',
    ]);
});

test('shipping agency admin can update order status', function (): void {
    $updateData = [
        'status' => 'completed',
        'notes' => 'Service completed',
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->put(route('orders.update', $this->order), $updateData);

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order updated successfully!');

    $this->assertDatabaseHas('orders', [
        'id' => $this->order->id,
        'status' => 'completed',
    ]);
});

test('shipping agency member cannot update order', function (): void {
    $updateData = [
        'status' => 'cancelled',
    ];

    $response = $this->actingAs($this->shippingAgencyMember)
        ->put(route('orders.update', $this->order), $updateData);

    $response->assertStatus(403);

    $this->assertDatabaseMissing('orders', [
        'id' => $this->order->id,
        'status' => 'cancelled',
    ]);
});

test('user cannot update order from different organizations', function (): void {
    $updateData = [
        'notes' => 'Unauthorized update',
    ];

    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->put(route('orders.update', $this->orderFromOtherOrgs), $updateData);

    $response->assertStatus(403);
});

test('vessel owner admin can delete own order', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->delete(route('orders.destroy', $this->order));

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order deleted successfully!');

    $this->assertDatabaseMissing('orders', [
        'id' => $this->order->id,
    ]);
});

test('vessel owner member cannot delete order', function (): void {
    $response = $this->actingAs($this->vesselOwnerMember)
        ->delete(route('orders.destroy', $this->order));

    $response->assertStatus(403);

    $this->assertDatabaseHas('orders', [
        'id' => $this->order->id,
    ]);
});

test('shipping agency user cannot delete order', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->delete(route('orders.destroy', $this->order));

    $response->assertStatus(403);

    $this->assertDatabaseHas('orders', [
        'id' => $this->order->id,
    ]);
});

test('platform admin can delete any order', function (): void {
    $response = $this->actingAs($this->platformAdmin)
        ->delete(route('orders.destroy', $this->order));

    $response->assertRedirect();
    $response->assertSessionHas('message', 'Order deleted successfully!');

    $this->assertDatabaseMissing('orders', [
        'id' => $this->order->id,
    ]);
});

test('user cannot delete order from different organization', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->delete(route('orders.destroy', $this->orderFromOtherOrgs));

    $response->assertStatus(403);

    $this->assertDatabaseHas('orders', [
        'id' => $this->orderFromOtherOrgs->id,
    ]);
});

test('user in multiple organizations sees orders from all their orgs', function (): void {
    // Attach the vessel owner admin to a shipping agency as well
    $this->vesselOwnerAdmin->organizations()->attach($this->shippingAgencyOrg, [
        'role' => UserRoles::MEMBER->value,
    ]);

    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('orders'));

    $response->assertStatus(200);

    // Should see orders from both organizations
    $response->assertInertia(fn($page) => $page->component('orders/index')
        ->has('orders', 1) // Still only one order involves their organizations
    );
});
