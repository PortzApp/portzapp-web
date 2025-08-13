<?php

use App\Enums\OrderGroupStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\User;
use App\Models\Vessel;

beforeEach(function (): void {
    // Create organizations
    $this->portzappTeamOrg = Organization::factory()->create([
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

    $this->shippingAgencyOrg2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Another Shipping Agency',
    ]);

    // Create users
    $this->portzappAdmin = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappAdmin->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::ADMIN->value]);

    $this->portzappViewer = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappViewer->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::VIEWER->value]);

    $this->vesselOwnerAdmin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN->value]);

    $this->vesselOwnerViewer = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerViewer->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::VIEWER->value]);

    $this->vesselOwnerAdmin2 = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg2->id]);
    $this->vesselOwnerAdmin2->organizations()->attach($this->vesselOwnerOrg2, ['role' => UserRoles::ADMIN->value]);

    $this->shippingAgencyAdmin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN->value]);

    $this->shippingAgencyViewer = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyViewer->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::VIEWER->value]);

    // Create test data
    $this->port = Port::factory()->create();
    $this->vessel = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg->id]);
    $this->vessel2 = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg2->id]);

    $this->service = Service::factory()->create(['organization_id' => $this->shippingAgencyOrg->id]);
    $this->service2 = Service::factory()->create(['organization_id' => $this->shippingAgencyOrg2->id]);

    // Create orders
    $this->orderFromVesselOwner = Order::factory()->create([
        'vessel_id' => $this->vessel->id,
        'port_id' => $this->port->id,
        'placed_by_user_id' => $this->vesselOwnerAdmin->id,
        'placed_by_organization_id' => $this->vesselOwnerOrg->id,
    ]);
    // Create order groups for shipping agencies to have access
    $this->orderGroup1 = OrderGroup::factory()->create([
        'order_id' => $this->orderFromVesselOwner->id,
        'fulfilling_organization_id' => $this->shippingAgencyOrg->id,
        'status' => OrderGroupStatus::PENDING,
    ]);
    $this->orderGroup1->services()->attach($this->service);

    $this->orderFromVesselOwner2 = Order::factory()->create([
        'vessel_id' => $this->vessel2->id,
        'port_id' => $this->port->id,
        'placed_by_user_id' => $this->vesselOwnerAdmin2->id,
        'placed_by_organization_id' => $this->vesselOwnerOrg2->id,
    ]);

    $this->orderGroup2 = OrderGroup::factory()->create([
        'order_id' => $this->orderFromVesselOwner2->id,
        'fulfilling_organization_id' => $this->shippingAgencyOrg2->id,
        'status' => OrderGroupStatus::PENDING,
    ]);
    $this->orderGroup2->services()->attach($this->service2);
});

describe('OrderPolicy viewAny', function (): void {
    it('allows all users to view any orders', function (): void {
        expect($this->portzappAdmin->can('viewAny', Order::class))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('viewAny', Order::class))->toBeTrue();
        expect($this->vesselOwnerViewer->can('viewAny', Order::class))->toBeTrue();
        expect($this->shippingAgencyAdmin->can('viewAny', Order::class))->toBeTrue();
        expect($this->shippingAgencyViewer->can('viewAny', Order::class))->toBeTrue();
    });
});

describe('OrderPolicy view', function (): void {
    it('allows PORTZAPP_TEAM admin to view all orders', function (): void {
        expect($this->portzappAdmin->can('view', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->portzappAdmin->can('view', $this->orderFromVesselOwner2))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM viewer to view all orders', function (): void {
        expect($this->portzappViewer->can('view', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->orderFromVesselOwner2))->toBeTrue();
    });

    it('allows VESSEL_OWNER admin to view their own orders only', function (): void {
        expect($this->vesselOwnerAdmin->can('view', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('view', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('allows VESSEL_OWNER viewer to view their own orders only', function (): void {
        expect($this->vesselOwnerViewer->can('view', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->vesselOwnerViewer->can('view', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('allows SHIPPING_AGENCY admin to view orders they are servicing', function (): void {
        expect($this->shippingAgencyAdmin->can('view', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->shippingAgencyAdmin->can('view', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('allows SHIPPING_AGENCY viewer to view orders they are servicing', function (): void {
        expect($this->shippingAgencyViewer->can('view', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->shippingAgencyViewer->can('view', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('denies cross-organization VESSEL_OWNER access', function (): void {
        expect($this->vesselOwnerAdmin2->can('view', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->vesselOwnerViewer->can('view', $this->orderFromVesselOwner2))->toBeFalse();
    });
});

describe('OrderPolicy create', function (): void {
    it('allows VESSEL_OWNER admin to create orders', function (): void {
        expect($this->vesselOwnerAdmin->can('create', Order::class))->toBeTrue();
    });

    it('denies VESSEL_OWNER viewer to create orders', function (): void {
        expect($this->vesselOwnerViewer->can('create', Order::class))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to create orders', function (): void {
        expect($this->shippingAgencyAdmin->can('create', Order::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('create', Order::class))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM users to create orders', function (): void {
        expect($this->portzappAdmin->can('create', Order::class))->toBeFalse();
        expect($this->portzappViewer->can('create', Order::class))->toBeFalse();
    });
});

describe('OrderPolicy update', function (): void {
    it('allows PORTZAPP_TEAM admin to update all orders', function (): void {
        expect($this->portzappAdmin->can('update', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->portzappAdmin->can('update', $this->orderFromVesselOwner2))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM viewer to update all orders', function (): void {
        expect($this->portzappViewer->can('update', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->portzappViewer->can('update', $this->orderFromVesselOwner2))->toBeTrue();
    });

    it('allows VESSEL_OWNER admin to update their own orders only', function (): void {
        expect($this->vesselOwnerAdmin->can('update', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('update', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('denies VESSEL_OWNER viewer to update orders', function (): void {
        expect($this->vesselOwnerViewer->can('update', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->vesselOwnerViewer->can('update', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to update orders', function (): void {
        expect($this->shippingAgencyAdmin->can('update', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->shippingAgencyViewer->can('update', $this->orderFromVesselOwner))->toBeFalse();
    });

    it('denies cross-organization VESSEL_OWNER admin access', function (): void {
        expect($this->vesselOwnerAdmin2->can('update', $this->orderFromVesselOwner))->toBeFalse();
    });
});

describe('OrderPolicy delete', function (): void {
    it('allows PORTZAPP_TEAM admin to delete all orders', function (): void {
        expect($this->portzappAdmin->can('delete', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->portzappAdmin->can('delete', $this->orderFromVesselOwner2))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM viewer to delete all orders', function (): void {
        expect($this->portzappViewer->can('delete', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->portzappViewer->can('delete', $this->orderFromVesselOwner2))->toBeTrue();
    });

    it('allows VESSEL_OWNER admin to delete their own orders only', function (): void {
        expect($this->vesselOwnerAdmin->can('delete', $this->orderFromVesselOwner))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('delete', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('denies VESSEL_OWNER viewer to delete orders', function (): void {
        expect($this->vesselOwnerViewer->can('delete', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->vesselOwnerViewer->can('delete', $this->orderFromVesselOwner2))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to delete orders', function (): void {
        expect($this->shippingAgencyAdmin->can('delete', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->shippingAgencyViewer->can('delete', $this->orderFromVesselOwner))->toBeFalse();
    });

    it('denies cross-organization VESSEL_OWNER admin access', function (): void {
        expect($this->vesselOwnerAdmin2->can('delete', $this->orderFromVesselOwner))->toBeFalse();
    });
});

describe('OrderPolicy restore and forceDelete', function (): void {
    it('denies all users to restore orders', function (): void {
        expect($this->portzappAdmin->can('restore', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('restore', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('restore', $this->orderFromVesselOwner))->toBeFalse();
    });

    it('denies all users to force delete orders', function (): void {
        expect($this->portzappAdmin->can('forceDelete', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('forceDelete', $this->orderFromVesselOwner))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('forceDelete', $this->orderFromVesselOwner))->toBeFalse();
    });
});
