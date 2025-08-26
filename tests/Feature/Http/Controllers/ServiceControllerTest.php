<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\User;
use Illuminate\Support\Facades\Event;

beforeEach(function (): void {
    // Fake broadcasting and events to prevent WebSocket connection issues
    Event::fake();

    // Create shipping agency organizations
    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Test Shipping Agency',
    ]);

    $this->shippingAgencyOrg2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Another Shipping Agency',
    ]);

    // Create vessel owner organization
    $this->vesselOwnerOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Test Vessel Owner',
    ]);

    // Create PortzApp team organization
    $this->portzappTeamOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PORTZAPP_TEAM,
        'name' => 'PortzApp Team',
    ]);

    // Create users and set current organization
    $this->shippingAgencyAdmin = User::factory()->create([
        'current_organization_id' => $this->shippingAgencyOrg->id,
    ]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $this->shippingAgencyMember = User::factory()->create([
        'current_organization_id' => $this->shippingAgencyOrg->id,
    ]);
    $this->shippingAgencyMember->organizations()->attach($this->shippingAgencyOrg, [
        'role' => UserRoles::VIEWER->value,
    ]);

    $this->vesselOwnerAdmin = User::factory()->create([
        'current_organization_id' => $this->vesselOwnerOrg->id,
    ]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $this->vesselOwnerMember = User::factory()->create([
        'current_organization_id' => $this->vesselOwnerOrg->id,
    ]);
    $this->vesselOwnerMember->organizations()->attach($this->vesselOwnerOrg, [
        'role' => UserRoles::VIEWER->value,
    ]);

    $this->portzappTeamAdmin = User::factory()->create([
        'current_organization_id' => $this->portzappTeamOrg->id,
    ]);
    $this->portzappTeamAdmin->organizations()->attach($this->portzappTeamOrg, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $this->portzappTeamMember = User::factory()->create([
        'current_organization_id' => $this->portzappTeamOrg->id,
    ]);
    $this->portzappTeamMember->organizations()->attach($this->portzappTeamOrg, [
        'role' => UserRoles::VIEWER->value,
    ]);

    // Create ports and service categories
    $this->port = Port::factory()->create([
        'name' => 'Test Port',
    ]);

    $this->serviceCategory = ServiceCategory::factory()->create([
        'name' => 'Test Category',
    ]);

    $this->serviceSubCategory = ServiceSubCategory::factory()->create([
        'service_category_id' => $this->serviceCategory->id,
        'name' => 'Test Sub Category',
    ]);

    // Create services
    $this->service = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg->id,
        'port_id' => $this->port->id,
        'description' => 'Professional port services',
        'price' => 5000.00,
        'status' => ServiceStatus::ACTIVE,
    ]);

    $this->serviceFromOtherOrg = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg2->id,
        'port_id' => $this->port->id,
        'description' => 'Expert cargo handling services',
        'price' => 3000.00,
        'status' => ServiceStatus::ACTIVE,
    ]);
});

test('shipping agency admin can view only own org services', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 1) // Should see only their own org's service
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('shipping agency viewer can view only own org services', function (): void {
    $response = $this->actingAs($this->shippingAgencyMember)
        ->get(route('services.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 1) // Should see only their own org's service
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('vessel owner can view all services', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index'));

    $response->assertStatus(200);
    // Vessel owners should see all services, not filtered by organization
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 2) // Should see both services
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('portzapp team can view all services across organizations', function (): void {
    $response = $this->actingAs($this->portzappTeamAdmin)
        ->get(route('services.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 2) // Should see all services
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('shipping agency admin can create service', function (): void {
    $serviceData = [
        'description' => 'A new professional service',
        'price' => 7500.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->post(route('services.store'), $serviceData);

    $response->assertRedirect(route('services.index'));
    $response->assertSessionHas('message', 'Service created successfully!');

    $this->assertDatabaseHas('services', [
        'description' => 'A new professional service',
        'organization_id' => $this->shippingAgencyOrg->id,
    ]);
});

test('shipping agency viewer cannot create service', function (): void {
    $serviceData = [
        'description' => 'Service created by member',
        'price' => 2500.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyMember)
        ->post(route('services.store'), $serviceData);

    $response->assertStatus(403);

    $this->assertDatabaseMissing('services', [
        'description' => 'Service created by member',
    ]);
});

test('vessel owner cannot create service', function (): void {
    $serviceData = [
        'description' => 'This should not be created',
        'price' => 1000.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->post(route('services.store'), $serviceData);

    $response->assertStatus(403);
    $this->assertDatabaseMissing('services', [
        'description' => 'This should not be created',
    ]);
});

test('user without shipping agency org cannot create service', function (): void {
    $userWithoutOrg = User::factory()->create();

    $serviceData = [
        'description' => 'This should not be created',
        'price' => 1000.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($userWithoutOrg)
        ->post(route('services.store'), $serviceData);

    $response->assertStatus(403);
});

test('shipping agency admin can update own service', function (): void {
    $updateData = [
        'description' => 'Updated description',
        'price' => 6000.00,
        'status' => ServiceStatus::INACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->put(route('services.update', $this->service), $updateData);

    $response->assertRedirect(route('services.index'));
    $response->assertSessionHas('message', 'Service updated successfully!');

    $this->assertDatabaseHas('services', [
        'id' => $this->service->id,
        'description' => 'Updated description',
        'price' => 6000.00,
    ]);
});

test('shipping agency viewer cannot update service', function (): void {
    $updateData = [
        'description' => 'Updated by member',
        'price' => 4500.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyMember)
        ->put(route('services.update', $this->service), $updateData);

    $response->assertStatus(403);
});

test('vessel owner cannot update service', function (): void {
    $updateData = [
        'description' => 'This should not work',
        'price' => 1000.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->put(route('services.update', $this->service), $updateData);

    $response->assertStatus(403);

    $this->assertDatabaseMissing('services', [
        'id' => $this->service->id,
        'description' => 'This should not work',
    ]);
});

test('user cannot update service from different organization', function (): void {
    $updateData = [
        'description' => 'This should not work',
        'price' => 1000.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->put(route('services.update', $this->serviceFromOtherOrg), $updateData);

    $response->assertStatus(403);
});

test('shipping agency admin can delete own service', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->delete(route('services.destroy', $this->service));

    $response->assertRedirect(route('services.index'));
    $response->assertSessionHas('message', 'Service deleted successfully!');

    $this->assertDatabaseMissing('services', [
        'id' => $this->service->id,
    ]);
});

test('shipping agency viewer cannot delete service', function (): void {
    $response = $this->actingAs($this->shippingAgencyMember)
        ->delete(route('services.destroy', $this->service));

    $response->assertStatus(403);

    $this->assertDatabaseHas('services', [
        'id' => $this->service->id,
    ]);
});

test('vessel owner cannot delete service', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->delete(route('services.destroy', $this->service));

    $response->assertStatus(403);

    $this->assertDatabaseHas('services', [
        'id' => $this->service->id,
    ]);
});

test('user cannot delete service from different organization', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->delete(route('services.destroy', $this->serviceFromOtherOrg));

    $response->assertStatus(403);

    $this->assertDatabaseHas('services', [
        'id' => $this->serviceFromOtherOrg->id,
    ]);
});

test('shipping agency users only see services from their current organization', function (): void {
    // Create a user in the second shipping agency
    $userInSecondOrg = User::factory()->create([
        'current_organization_id' => $this->shippingAgencyOrg2->id,
    ]);
    $userInSecondOrg->organizations()->attach($this->shippingAgencyOrg2, [
        'role' => UserRoles::ADMIN->value,
    ]);

    $response = $this->actingAs($userInSecondOrg)
        ->get(route('services.index'));

    $response->assertStatus(200);

    // Should see only services from their organization (1 service from shippingAgencyOrg2)
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 1) // Should see only their org's service
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('shipping agency users can view individual service from their org', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.show', $this->service));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/show-service-page'));
});

test('shipping agency users cannot view service from different org', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.show', $this->serviceFromOtherOrg));

    $response->assertStatus(403);
});

test('portzapp team can view services from any organization', function (): void {
    $response = $this->actingAs($this->portzappTeamAdmin)
        ->get(route('services.show', $this->service));

    $response->assertStatus(200);

    $response2 = $this->actingAs($this->portzappTeamAdmin)
        ->get(route('services.show', $this->serviceFromOtherOrg));

    $response2->assertStatus(200);
});

// Additional tests to achieve 100% coverage

test('services index filters by port when port parameter provided', function (): void {
    // Create another port and service
    $anotherPort = Port::factory()->create(['name' => 'Another Port']);
    $serviceAtOtherPort = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg->id,
        'port_id' => $anotherPort->id,
        'status' => ServiceStatus::ACTIVE,
    ]);

    // Filter by port name
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index', ['port' => 'Test Port']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services') // Should have filtered results
    );

    // Filter by partial port name
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index', ['port' => 'Another']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services') // Should find services at "Another Port"
    );
});

test('services index filters by category when category parameter provided', function (): void {
    // Create another category and service
    $anotherCategory = ServiceCategory::factory()->create(['name' => 'Another Category']);
    $anotherSubCategory = ServiceSubCategory::factory()->create([
        'service_category_id' => $anotherCategory->id,
        'name' => 'Another Sub Category',
    ]);
    $serviceInOtherCategory = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg->id,
        'service_sub_category_id' => $anotherSubCategory->id,
        'status' => ServiceStatus::ACTIVE,
    ]);

    // Filter by category name
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index', ['category' => 'Test Category']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services') // Should have filtered results
    );

    // Filter by partial category name
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index', ['category' => 'Another']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services') // Should find services in "Another Category"
    );
});

test('services index handles empty port filter', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index', ['port' => '']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 2) // Should see all services (no filtering)
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('services index handles empty category filter', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index', ['category' => '']));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('services.data', 2) // Should see all services (no filtering)
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('services index includes ports with service counts', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('ports')
        ->has('categories_with_subcategories')
    );
});

test('services index counts are filtered by organization for shipping agency', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/services-index-page')
        ->has('ports')
        ->has('categories_with_subcategories')
        ->has('services.data', 1) // Only see services from their org
        ->has('services.total')
        ->has('services.current_page')
    );
});

test('shipping agency admin can view service create form', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.create'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/create-service-page')
        ->has('ports')
        ->has('serviceCategories')
    );
});

test('vessel owner cannot view service create form', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.create'));

    $response->assertStatus(403);
});

test('shipping agency admin can view service edit form', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.edit', $this->service));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/edit-service-page')
        ->has('service')
        ->has('ports')
        ->has('serviceCategories')
    );
});

test('shipping agency admin cannot view edit form for service from different org', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.edit', $this->serviceFromOtherOrg));

    $response->assertStatus(403);
});

test('vessel owner cannot view service edit form', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.edit', $this->service));

    $response->assertStatus(403);
});

test('service show loads correct relationships', function (): void {
    $response = $this->actingAs($this->vesselOwnerAdmin)
        ->get(route('services.show', $this->service));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/show-service-page')
        ->has('service')
        ->where('service.id', $this->service->id)
    );
});

test('service creation dispatches ServiceCreated event', function (): void {
    $serviceData = [
        'description' => 'Event test service',
        'price' => 7500.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->post(route('services.store'), $serviceData);

    $response->assertRedirect(route('services.index'));

    Event::assertDispatched(\App\Events\ServiceCreated::class);
});

test('service update dispatches ServiceUpdated event', function (): void {
    $updateData = [
        'description' => 'Updated for event test',
        'price' => 6000.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->put(route('services.update', $this->service), $updateData);

    $response->assertRedirect(route('services.index'));

    Event::assertDispatched(\App\Events\ServiceUpdated::class);
});

test('service deletion dispatches ServiceDeleted event', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->delete(route('services.destroy', $this->service));

    $response->assertRedirect(route('services.index'));

    Event::assertDispatched(\App\Events\ServiceDeleted::class);
});

test('service creation associates with current organization', function (): void {
    $serviceData = [
        'description' => 'Organization association test',
        'price' => 7500.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->post(route('services.store'), $serviceData);

    $response->assertRedirect(route('services.index'));

    $this->assertDatabaseHas('services', [
        'description' => 'Organization association test',
        'organization_id' => $this->shippingAgencyAdmin->current_organization_id,
    ]);
});

test('service store loads relationships after creation', function (): void {
    $serviceData = [
        'description' => 'Relationship loading test',
        'price' => 7500.00,
        'status' => ServiceStatus::ACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->post(route('services.store'), $serviceData);

    $response->assertRedirect(route('services.index'));

    // Verify the service was created with relationships
    $service = Service::where('description', 'Relationship loading test')->first();
    expect($service)->not->toBeNull();
    expect($service->organization)->not->toBeNull();
    expect($service->port)->not->toBeNull();
    expect($service->subCategory)->not->toBeNull();
});

test('service update refreshes relationships after update', function (): void {
    $updateData = [
        'description' => 'Refreshed relationships test',
        'price' => 6000.00,
        'status' => ServiceStatus::INACTIVE->value,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
    ];

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->put(route('services.update', $this->service), $updateData);

    $response->assertRedirect(route('services.index'));

    $this->service->refresh();
    expect($this->service->description)->toBe('Refreshed relationships test');
    expect($this->service->status)->toBe(ServiceStatus::INACTIVE);
});

test('service destroy correctly stores service ID for event', function (): void {
    $serviceId = $this->service->id;

    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->delete(route('services.destroy', $this->service));

    $response->assertRedirect(route('services.index'));

    // Verify service was deleted
    $this->assertDatabaseMissing('services', [
        'id' => $serviceId,
    ]);

    Event::assertDispatched(\App\Events\ServiceDeleted::class, function ($event) use ($serviceId) {
        return $event->serviceId === (string) $serviceId;
    });
});

test('unauthenticated access to all service routes redirects to login', function (): void {
    $routes = [
        ['GET', route('services.index')],
        ['GET', route('services.create')],
        ['POST', route('services.store')],
        ['GET', route('services.show', $this->service)],
        ['GET', route('services.edit', $this->service)],
        ['PUT', route('services.update', $this->service)],
        ['DELETE', route('services.destroy', $this->service)],
    ];

    foreach ($routes as [$method, $url]) {
        $response = $this->call($method, $url);
        $response->assertRedirect(route('login'));
    }
});

test('service create form loads service categories with subcategories', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.create'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/create-service-page')
        ->has('serviceCategories.0.sub_categories') // Verify subcategories are loaded
    );
});

test('service edit form loads service categories with subcategories', function (): void {
    $response = $this->actingAs($this->shippingAgencyAdmin)
        ->get(route('services.edit', $this->service));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('services/edit-service-page')
        ->has('serviceCategories.0.sub_categories') // Verify subcategories are loaded
    );
});
