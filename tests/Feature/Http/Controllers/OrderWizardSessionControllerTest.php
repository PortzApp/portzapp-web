<?php

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Enums\UserRoles;
use App\Enums\WizardStep;
use App\Models\Order;
use App\Models\OrderWizardSession;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Support\Facades\Event;

beforeEach(function (): void {
    // Fake broadcasting and events to prevent WebSocket connection issues
    Event::fake();
    // Create organizations
    $this->vesselOwnerOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Test Vessel Owner',
    ]);

    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Test Shipping Agency',
    ]);

    $this->portzappOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PORTZAPP_TEAM,
        'name' => 'PortzApp Team',
    ]);

    // Create users
    $this->vesselOwnerAdmin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN]);

    $this->vesselOwnerViewer = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerViewer->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::VIEWER]);

    $this->shippingAgencyAdmin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN]);

    // Create test data
    $this->port = Port::factory()->create();
    $this->vessel = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg->id]);

    $this->serviceCategory = ServiceCategory::factory()->create(['name' => 'Test Category']);
    $this->serviceSubCategory = ServiceSubCategory::factory()->create([
        'service_category_id' => $this->serviceCategory->id,
        'name' => 'Test Sub Category',
    ]);

    $this->service = Service::factory()->create([
        'organization_id' => $this->shippingAgencyOrg->id,
        'port_id' => $this->port->id,
        'service_sub_category_id' => $this->serviceSubCategory->id,
        'status' => 'active',
    ]);

    // Create test wizard session
    $this->wizardSession = OrderWizardSession::factory()->create([
        'user_id' => $this->vesselOwnerAdmin->id,
        'organization_id' => $this->vesselOwnerOrg->id,
        'session_name' => 'Test Session',
        'current_step' => WizardStep::VESSEL_PORT,
        'status' => 'draft',
    ]);
});

describe('OrderWizardSessionController index', function (): void {
    it('returns active sessions for current user and organization', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard-sessions.index'));

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('sessions');

        $sessions = session('sessions');
        expect($sessions)->toHaveCount(1);
        expect($sessions->first()->id)->toBe($this->wizardSession->id);
    });

    it('filters sessions by current organization', function (): void {
        // Create session for different organization
        $otherSession = OrderWizardSession::factory()->create([
            'user_id' => $this->vesselOwnerAdmin->id,
            'organization_id' => $this->shippingAgencyOrg->id,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard-sessions.index'));

        $response->assertRedirect(route('dashboard'));
        $sessions = session('sessions');
        expect($sessions)->toHaveCount(1);
        expect($sessions->first()->id)->toBe($this->wizardSession->id);
    });

    it('only shows active sessions', function (): void {
        $this->wizardSession->update(['status' => 'completed']);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard-sessions.index'));

        $response->assertRedirect(route('dashboard'));
        $sessions = session('sessions');
        expect($sessions)->toHaveCount(0);
    });

    it('denies unauthorized access', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('order-wizard-sessions.index'));

        $response->assertForbidden();
    });
});

describe('OrderWizardSessionController store', function (): void {
    it('creates new wizard session', function (): void {
        $sessionData = [
            'session_name' => 'New Test Session',
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.store'), $sessionData);

        $response->assertRedirect();
        $this->assertDatabaseHas('order_wizard_sessions', [
            'user_id' => $this->vesselOwnerAdmin->id,
            'organization_id' => $this->vesselOwnerOrg->id,
            'session_name' => 'New Test Session',
            'current_step' => WizardStep::VESSEL_PORT->value,
            'status' => 'draft',
        ]);
    });

    it('creates session with default name if not provided', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.store'), []);

        $response->assertRedirect();
        $this->assertDatabaseHas('order_wizard_sessions', [
            'user_id' => $this->vesselOwnerAdmin->id,
        ]);

        $session = OrderWizardSession::where('user_id', $this->vesselOwnerAdmin->id)
            ->latest()->first();
        expect($session->session_name)->toContain('Order Draft');
    });

    it('sets expires_at to 30 days from now', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.store'), []);

        $session = OrderWizardSession::where('user_id', $this->vesselOwnerAdmin->id)
            ->latest()->first();

        expect(now()->diffInDays($session->expires_at))->toBeGreaterThan(29);
        expect(now()->diffInDays($session->expires_at))->toBeLessThan(31);
    });

    it('denies unauthorized access', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->post(route('order-wizard-sessions.store'), []);

        $response->assertForbidden();
    });
});

describe('OrderWizardSessionController show', function (): void {
    it('returns session details', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard-sessions.show', $this->wizardSession));

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('session');

        $session = session('session');
        expect($session->id)->toBe($this->wizardSession->id);
    });

    it('denies unauthorized access', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('order-wizard-sessions.show', $this->wizardSession));

        $response->assertForbidden();
    });
});

describe('OrderWizardSessionController update', function (): void {
    it('updates session with valid data', function (): void {
        $updateData = [
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
            'current_step' => WizardStep::CATEGORIES->value,
            'session_name' => 'Updated Session Name',
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.update', $this->wizardSession), $updateData);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->vessel_id)->toBe($this->vessel->id);
        expect($this->wizardSession->port_id)->toBe($this->port->id);
        expect($this->wizardSession->current_step)->toBe(WizardStep::CATEGORIES);
        expect($this->wizardSession->session_name)->toBe('Updated Session Name');
    });

    it('validates update data', function (): void {
        $invalidData = [
            'vessel_id' => 99999, // Non-existent vessel
            'port_id' => 99999,   // Non-existent port
            'current_step' => 'invalid_step',
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.update', $this->wizardSession), $invalidData);

        $response->assertSessionHasErrors(['vessel_id', 'port_id', 'current_step']);
    });

    it('filters null values when updating', function (): void {
        $updateData = [
            'vessel_id' => null,
            'port_id' => $this->port->id,
            'current_step' => WizardStep::CATEGORIES->value,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.update', $this->wizardSession), $updateData);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->vessel_id)->toBeNull();
        expect($this->wizardSession->port_id)->toBe($this->port->id);
    });
});

describe('OrderWizardSessionController setVesselAndPort', function (): void {
    it('sets vessel and port and moves to categories step', function (): void {
        $data = [
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.vessel-port', $this->wizardSession), $data);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->vessel_id)->toBe($this->vessel->id);
        expect($this->wizardSession->port_id)->toBe($this->port->id);
        expect($this->wizardSession->current_step)->toBe(WizardStep::CATEGORIES);
    });

    it('validates required vessel and port', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.vessel-port', $this->wizardSession), []);

        $response->assertSessionHasErrors(['vessel_id', 'port_id']);
    });
});

describe('OrderWizardSessionController setCategories', function (): void {
    it('sets selected categories and moves to services step', function (): void {
        $data = [
            'selected_sub_categories' => [$this->serviceSubCategory->id],
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.categories', $this->wizardSession), $data);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->current_step)->toBe(WizardStep::SERVICES);
        expect($this->wizardSession->categorySelections)->toHaveCount(1);
    });

    it('clears existing category selections before adding new ones', function (): void {
        // Add existing selection
        $this->wizardSession->categorySelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'order_index' => 0,
        ]);

        $newSubCategory = ServiceSubCategory::factory()->create([
            'service_category_id' => $this->serviceCategory->id,
        ]);

        $data = [
            'selected_sub_categories' => [$newSubCategory->id],
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.categories', $this->wizardSession), $data);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->categorySelections)->toHaveCount(1);
        expect($this->wizardSession->categorySelections->first()->service_sub_category_id)->toBe($newSubCategory->id);
    });

    it('validates required sub categories', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.categories', $this->wizardSession), [
                'selected_sub_categories' => [],
            ]);

        $response->assertSessionHasErrors('selected_sub_categories');
    });

    it('validates sub category exists', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.categories', $this->wizardSession), [
                'selected_sub_categories' => [99999],
            ]);

        $response->assertSessionHasErrors('selected_sub_categories.0');
    });

    it('allows multiple sub-categories from the same parent category', function (): void {
        // Create another sub-category under the same parent category
        $secondSubCategory = ServiceSubCategory::factory()->create([
            'service_category_id' => $this->serviceCategory->id,
            'name' => 'Second Sub Category',
        ]);

        $data = [
            'selected_sub_categories' => [$this->serviceSubCategory->id, $secondSubCategory->id],
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.categories', $this->wizardSession), $data);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->current_step)->toBe(WizardStep::SERVICES);
        expect($this->wizardSession->categorySelections)->toHaveCount(2);

        // Both should have the same parent category but different sub-categories
        $selections = $this->wizardSession->categorySelections;
        expect($selections->pluck('service_category_id')->unique())->toHaveCount(1);
        expect($selections->pluck('service_sub_category_id')->unique())->toHaveCount(2);
    });
});

describe('OrderWizardSessionController setServices', function (): void {
    it('sets selected services and moves to review step', function (): void {
        // Set up required session data for validation
        $this->wizardSession->update([
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
        ]);

        // Add required category selections for validation
        $this->wizardSession->categorySelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'order_index' => 0,
        ]);

        $data = [
            'selected_services' => [$this->service->id],
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.services', $this->wizardSession), $data);

        $response->assertRedirect();

        $this->wizardSession->refresh();
        expect($this->wizardSession->current_step)->toBe(WizardStep::REVIEW);
        expect($this->wizardSession->serviceSelections)->toHaveCount(1);

        $serviceSelection = $this->wizardSession->serviceSelections->first();
        expect($serviceSelection->service_id)->toBe($this->service->id);
        expect($serviceSelection->organization_id)->toBe($this->service->organization_id);
        expect((float) $serviceSelection->price_snapshot)->toBe((float) $this->service->price);
    });

    it('clears existing service selections before adding new ones', function (): void {
        // Set up required session data for validation
        $this->wizardSession->update([
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
        ]);

        // Add required category selections for validation
        $this->wizardSession->categorySelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'order_index' => 0,
        ]);

        // Add existing selection
        $this->wizardSession->serviceSelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_id' => $this->service->id,
            'organization_id' => $this->service->organization_id,
            'price_snapshot' => $this->service->price,
        ]);

        $newService = Service::factory()->create([
            'organization_id' => $this->shippingAgencyOrg->id,
            'port_id' => $this->port->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'status' => ServiceStatus::ACTIVE,
        ]);

        $data = [
            'selected_services' => [$newService->id],
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.services', $this->wizardSession), $data);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $this->wizardSession->refresh();
        $this->wizardSession->load('serviceSelections');
        expect($this->wizardSession->serviceSelections)->toHaveCount(1);
        expect($this->wizardSession->serviceSelections->first()->service_id)->toBe($newService->id);
    });

    it('validates required services', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.services', $this->wizardSession), [
                'selected_services' => [],
            ]);

        $response->assertSessionHasErrors('selected_services');
    });

    it('validates service exists', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->patch(route('order-wizard-sessions.services', $this->wizardSession), [
                'selected_services' => [99999],
            ]);

        $response->assertSessionHasErrors('selected_services.0');
    });
});

describe('OrderWizardSessionController destroy', function (): void {
    it('deletes wizard session', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->delete(route('order-wizard-sessions.destroy', $this->wizardSession));

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Session deleted successfully.');

        $this->assertDatabaseMissing('order_wizard_sessions', [
            'id' => $this->wizardSession->id,
        ]);
    });

    it('returns updated sessions list after deletion', function (): void {
        // Create another session
        $anotherSession = OrderWizardSession::factory()->active()->create([
            'user_id' => $this->vesselOwnerAdmin->id,
            'organization_id' => $this->vesselOwnerOrg->id,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->delete(route('order-wizard-sessions.destroy', $this->wizardSession));

        $response->assertRedirect();
        $sessions = session('sessions');
        expect($sessions)->toHaveCount(1);
        expect($sessions->first()->id)->toBe($anotherSession->id);
    });
});

describe('OrderWizardSessionController complete', function (): void {
    beforeEach(function (): void {
        // Setup complete session
        $this->wizardSession->update([
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
            'current_step' => WizardStep::REVIEW,
        ]);

        $this->wizardSession->categorySelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'order_index' => 0,
        ]);

        $this->wizardSession->serviceSelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_id' => $this->service->id,
            'organization_id' => $this->service->organization_id,
            'price_snapshot' => $this->service->price,
        ]);
    });

    it('creates order and order groups from completed session', function (): void {
        $completionData = [
            'notes' => 'Test order notes',
        ];

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.complete', $this->wizardSession), $completionData);

        $response->assertRedirect();
        $response->assertSessionHas('message', 'Order created successfully!');

        // Check order was created
        $this->assertDatabaseHas('orders', [
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
            'placed_by_user_id' => $this->vesselOwnerAdmin->id,
            'placed_by_organization_id' => $this->vesselOwnerOrg->id,
            'notes' => 'Test order notes',
            'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION->value,
        ]);

        // Check order group was created
        $order = Order::where('vessel_id', $this->vessel->id)->first();
        $this->assertDatabaseHas('order_groups', [
            'order_id' => $order->id,
            'fulfilling_organization_id' => $this->service->organization_id,
            'status' => OrderGroupStatus::PENDING->value,
        ]);

        // Check session was marked as completed
        $this->wizardSession->refresh();
        expect($this->wizardSession->status)->toBe('completed');
        expect($this->wizardSession->completed_at)->not->toBeNull();
    });

    it('validates session has required data before completion', function (): void {
        $incompleteSession = OrderWizardSession::factory()->create([
            'user_id' => $this->vesselOwnerAdmin->id,
            'organization_id' => $this->vesselOwnerOrg->id,
            'vessel_id' => null, // Missing vessel
            'port_id' => $this->port->id,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.complete', $incompleteSession), []);

        $response->assertSessionHasErrors('error');
    });

    it('handles transaction rollback on failure', function (): void {
        // Store the original vessel_id
        $originalVesselId = $this->wizardSession->vessel_id;

        // Delete the vessel after the session is set up to cause a foreign key constraint failure during order creation
        $this->vessel->delete();

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.complete', $this->wizardSession), []);

        $response->assertSessionHasErrors('error');

        // Session should not be marked as completed
        $this->wizardSession->refresh();
        expect($this->wizardSession->status)->toBe('draft');
    });

    it('creates multiple order groups for services from different organizations', function (): void {
        // Create service from different organization
        $anotherOrg = Organization::factory()->create([
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        ]);

        $anotherService = Service::factory()->create([
            'organization_id' => $anotherOrg->id,
            'port_id' => $this->port->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
        ]);

        $this->wizardSession->serviceSelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_id' => $anotherService->id,
            'organization_id' => $anotherService->organization_id,
            'price_snapshot' => $anotherService->price,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->post(route('order-wizard-sessions.complete', $this->wizardSession), []);

        $response->assertRedirect();

        $order = Order::where('vessel_id', $this->vessel->id)->first();

        // Should have 2 order groups (one for each organization)
        expect($order->orderGroups)->toHaveCount(2);

        $orgIds = $order->orderGroups->pluck('fulfilling_organization_id');
        expect($orgIds)->toContain($this->service->organization_id);
        expect($orgIds)->toContain($anotherService->organization_id);
    });
});

describe('OrderWizardSessionController step navigation', function (): void {
    it('shows vessel port step', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.step.vessel-port', $this->wizardSession));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('orders/wizard/order-wizard-step-vessel-port')
            ->has('session')
            ->has('vessels')
            ->has('ports')
        );

        $this->wizardSession->refresh();
        expect($this->wizardSession->current_step)->toBe(WizardStep::VESSEL_PORT);
    });

    it('shows categories step with port filtering', function (): void {
        $this->wizardSession->update([
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.step.categories', $this->wizardSession));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('orders/wizard/order-wizard-step-categories')
            ->has('session')
            ->has('serviceCategories')
        );
    });

    it('redirects to vessel port step if vessel or port missing', function (): void {
        $this->wizardSession->update([
            'vessel_id' => null,
            'port_id' => $this->port->id,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.step.categories', $this->wizardSession));

        $response->assertRedirect(route('order-wizard.step', [
            'session' => $this->wizardSession->id,
            'step' => 'vessel_port',
        ]));
        $response->assertSessionHasErrors('error');
    });

    it('shows services step with filtering by port and categories', function (): void {
        $this->wizardSession->update([
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
        ]);

        $this->wizardSession->categorySelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'order_index' => 0,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.step.services', $this->wizardSession));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('orders/wizard/order-wizard-step-services')
            ->has('session')
            ->has('services')
        );
    });

    it('shows review step with all data', function (): void {
        $this->wizardSession->update([
            'vessel_id' => $this->vessel->id,
            'port_id' => $this->port->id,
        ]);

        $this->wizardSession->categorySelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_sub_category_id' => $this->serviceSubCategory->id,
            'order_index' => 0,
        ]);

        $this->wizardSession->serviceSelections()->create([
            'service_category_id' => $this->serviceCategory->id,
            'service_id' => $this->service->id,
            'organization_id' => $this->service->organization_id,
            'price_snapshot' => $this->service->price,
        ]);

        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.step.review', $this->wizardSession));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('orders/wizard/order-wizard-step-review')
            ->has('session')
        );
    });

    it('shows dashboard with user sessions', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.dashboard'));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('orders/wizard/order-wizard-dashboard')
            ->has('sessions')
        );
    });

    it('shows wizard flow', function (): void {
        $response = $this->actingAs($this->vesselOwnerAdmin)
            ->get(route('order-wizard.flow', $this->wizardSession));

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('orders/wizard/order-wizard-flow')
            ->has('session')
            ->has('vessels')
            ->has('ports')
            ->has('serviceCategories')
            ->has('services')
        );
    });
});

describe('OrderWizardSessionController authorization edge cases', function (): void {
    it('handles unauthenticated requests properly', function (): void {
        $routes = [
            ['GET', route('order-wizard-sessions.index')],
            ['POST', route('order-wizard-sessions.store')],
            ['GET', route('order-wizard-sessions.show', $this->wizardSession)],
            ['PATCH', route('order-wizard-sessions.update', $this->wizardSession)],
            ['DELETE', route('order-wizard-sessions.destroy', $this->wizardSession)],
            ['GET', route('order-wizard.dashboard')],
        ];

        foreach ($routes as [$method, $url]) {
            $response = $this->call($method, $url);
            $response->assertRedirect(route('login'));
        }
    });

    it('handles users without vessel owner organization', function (): void {
        $response = $this->actingAs($this->shippingAgencyAdmin)
            ->get(route('order-wizard-sessions.index'));

        $response->assertForbidden();
    });
});
