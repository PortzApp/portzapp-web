<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\Service;
use App\Models\User;

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

    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Test Shipping Agency',
    ]);

    $this->shippingAgencyOrg2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'Another Shipping Agency',
    ]);

    // Create PORTZAPP_TEAM users
    $this->portzappAdmin = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappAdmin->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::ADMIN->value]);

    $this->portzappViewer = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappViewer->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::VIEWER->value]);

    // Create VESSEL_OWNER users
    $this->vesselOwnerAdmin = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerAdmin->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN->value]);

    $this->vesselOwnerViewer = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwnerViewer->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::VIEWER->value]);

    // Create SHIPPING_AGENCY users
    $this->shippingAgencyAdmin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN->value]);

    $this->shippingAgencyViewer = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyViewer->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::VIEWER->value]);

    // Create second shipping agency users
    $this->shippingAgencyAdmin2 = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg2->id]);
    $this->shippingAgencyAdmin2->organizations()->attach($this->shippingAgencyOrg2, ['role' => UserRoles::ADMIN->value]);

    // Create test services
    $this->service = Service::factory()->create(['organization_id' => $this->shippingAgencyOrg->id]);
    $this->service2 = Service::factory()->create(['organization_id' => $this->shippingAgencyOrg2->id]);
});

describe('ServicePolicy viewAny', function (): void {
    it('allows all users to view any services', function (): void {
        expect($this->portzappAdmin->can('viewAny', Service::class))->toBeTrue();
        expect($this->portzappViewer->can('viewAny', Service::class))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('viewAny', Service::class))->toBeTrue();
        expect($this->vesselOwnerViewer->can('viewAny', Service::class))->toBeTrue();
        expect($this->shippingAgencyAdmin->can('viewAny', Service::class))->toBeTrue();
        expect($this->shippingAgencyViewer->can('viewAny', Service::class))->toBeTrue();
    });
});

describe('ServicePolicy view', function (): void {
    it('allows PORTZAPP_TEAM users to view all services', function (): void {
        expect($this->portzappAdmin->can('view', $this->service))->toBeTrue();
        expect($this->portzappAdmin->can('view', $this->service2))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->service))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->service2))->toBeTrue();
    });

    it('allows VESSEL_OWNER users to view all services', function (): void {
        expect($this->vesselOwnerAdmin->can('view', $this->service))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('view', $this->service2))->toBeTrue();
        expect($this->vesselOwnerViewer->can('view', $this->service))->toBeTrue();
        expect($this->vesselOwnerViewer->can('view', $this->service2))->toBeTrue();
    });

    it('allows SHIPPING_AGENCY users to view only their own services', function (): void {
        expect($this->shippingAgencyAdmin->can('view', $this->service))->toBeTrue();
        expect($this->shippingAgencyAdmin->can('view', $this->service2))->toBeFalse();
        expect($this->shippingAgencyViewer->can('view', $this->service))->toBeTrue();
        expect($this->shippingAgencyViewer->can('view', $this->service2))->toBeFalse();
    });

    it('denies cross-organization SHIPPING_AGENCY access', function (): void {
        expect($this->shippingAgencyAdmin2->can('view', $this->service))->toBeFalse();
    });
});

describe('ServicePolicy create', function (): void {
    it('allows SHIPPING_AGENCY admin to create services', function (): void {
        expect($this->shippingAgencyAdmin->can('create', Service::class))->toBeTrue();
    });

    it('denies SHIPPING_AGENCY viewer to create services', function (): void {
        expect($this->shippingAgencyViewer->can('create', Service::class))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to create services', function (): void {
        expect($this->vesselOwnerAdmin->can('create', Service::class))->toBeFalse();
        expect($this->vesselOwnerViewer->can('create', Service::class))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM users to create services', function (): void {
        expect($this->portzappAdmin->can('create', Service::class))->toBeFalse();
        expect($this->portzappViewer->can('create', Service::class))->toBeFalse();
    });
});

describe('ServicePolicy update', function (): void {
    it('allows SHIPPING_AGENCY admin to update their own services only', function (): void {
        expect($this->shippingAgencyAdmin->can('update', $this->service))->toBeTrue();
        expect($this->shippingAgencyAdmin->can('update', $this->service2))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY viewer to update services', function (): void {
        expect($this->shippingAgencyViewer->can('update', $this->service))->toBeFalse();
        expect($this->shippingAgencyViewer->can('update', $this->service2))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to update services', function (): void {
        expect($this->vesselOwnerAdmin->can('update', $this->service))->toBeFalse();
        expect($this->vesselOwnerViewer->can('update', $this->service))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM users to update services', function (): void {
        expect($this->portzappAdmin->can('update', $this->service))->toBeFalse();
        expect($this->portzappViewer->can('update', $this->service))->toBeFalse();
    });

    it('denies cross-organization SHIPPING_AGENCY admin access', function (): void {
        expect($this->shippingAgencyAdmin2->can('update', $this->service))->toBeFalse();
    });
});

describe('ServicePolicy delete', function (): void {
    it('allows SHIPPING_AGENCY admin to delete their own services only', function (): void {
        expect($this->shippingAgencyAdmin->can('delete', $this->service))->toBeTrue();
        expect($this->shippingAgencyAdmin->can('delete', $this->service2))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY viewer to delete services', function (): void {
        expect($this->shippingAgencyViewer->can('delete', $this->service))->toBeFalse();
        expect($this->shippingAgencyViewer->can('delete', $this->service2))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to delete services', function (): void {
        expect($this->vesselOwnerAdmin->can('delete', $this->service))->toBeFalse();
        expect($this->vesselOwnerViewer->can('delete', $this->service))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM users to delete services', function (): void {
        expect($this->portzappAdmin->can('delete', $this->service))->toBeFalse();
        expect($this->portzappViewer->can('delete', $this->service))->toBeFalse();
    });

    it('denies cross-organization SHIPPING_AGENCY admin access', function (): void {
        expect($this->shippingAgencyAdmin2->can('delete', $this->service))->toBeFalse();
    });
});

describe('ServicePolicy restore and forceDelete', function (): void {
    it('denies all users to restore services', function (): void {
        expect($this->portzappAdmin->can('restore', $this->service))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('restore', $this->service))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('restore', $this->service))->toBeFalse();
    });

    it('denies all users to force delete services', function (): void {
        expect($this->portzappAdmin->can('forceDelete', $this->service))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('forceDelete', $this->service))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('forceDelete', $this->service))->toBeFalse();
    });
});
