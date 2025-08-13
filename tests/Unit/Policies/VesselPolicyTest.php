<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
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

    // Create second vessel owner users
    $this->vesselOwnerAdmin2 = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg2->id]);
    $this->vesselOwnerAdmin2->organizations()->attach($this->vesselOwnerOrg2, ['role' => UserRoles::ADMIN->value]);

    // Create SHIPPING_AGENCY users
    $this->shippingAgencyAdmin = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyAdmin->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN->value]);

    $this->shippingAgencyViewer = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->shippingAgencyViewer->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::VIEWER->value]);

    // Create test vessels
    $this->vessel = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg->id]);
    $this->vessel2 = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg2->id]);
});

describe('VesselPolicy viewAny', function (): void {
    it('allows VESSEL_OWNER users to view any vessels', function (): void {
        expect($this->vesselOwnerAdmin->can('viewAny', Vessel::class))->toBeTrue();
        expect($this->vesselOwnerViewer->can('viewAny', Vessel::class))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM users to view any vessels', function (): void {
        expect($this->portzappAdmin->can('viewAny', Vessel::class))->toBeTrue();
        expect($this->portzappViewer->can('viewAny', Vessel::class))->toBeTrue();
    });

    it('denies SHIPPING_AGENCY users to view any vessels', function (): void {
        expect($this->shippingAgencyAdmin->can('viewAny', Vessel::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('viewAny', Vessel::class))->toBeFalse();
    });
});

describe('VesselPolicy view', function (): void {
    it('allows VESSEL_OWNER users to view vessels', function (): void {
        expect($this->vesselOwnerAdmin->can('view', $this->vessel))->toBeTrue();
        expect($this->vesselOwnerViewer->can('view', $this->vessel))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('view', $this->vessel2))->toBeTrue();
        expect($this->vesselOwnerViewer->can('view', $this->vessel2))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM users to view vessels', function (): void {
        expect($this->portzappAdmin->can('view', $this->vessel))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->vessel))->toBeTrue();
        expect($this->portzappAdmin->can('view', $this->vessel2))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->vessel2))->toBeTrue();
    });

    it('denies SHIPPING_AGENCY users to view vessels', function (): void {
        expect($this->shippingAgencyAdmin->can('view', $this->vessel))->toBeFalse();
        expect($this->shippingAgencyViewer->can('view', $this->vessel))->toBeFalse();
    });
});

describe('VesselPolicy create', function (): void {
    it('allows VESSEL_OWNER admin to create vessels', function (): void {
        expect($this->vesselOwnerAdmin->can('create', Vessel::class))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM admin to create vessels', function (): void {
        expect($this->portzappAdmin->can('create', Vessel::class))->toBeTrue();
    });

    it('denies VESSEL_OWNER viewer to create vessels', function (): void {
        expect($this->vesselOwnerViewer->can('create', Vessel::class))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM viewer to create vessels', function (): void {
        expect($this->portzappViewer->can('create', Vessel::class))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to create vessels', function (): void {
        expect($this->shippingAgencyAdmin->can('create', Vessel::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('create', Vessel::class))->toBeFalse();
    });
});

describe('VesselPolicy update', function (): void {
    it('allows VESSEL_OWNER admin to update vessels', function (): void {
        expect($this->vesselOwnerAdmin->can('update', $this->vessel))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('update', $this->vessel2))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM admin to update vessels', function (): void {
        expect($this->portzappAdmin->can('update', $this->vessel))->toBeTrue();
        expect($this->portzappAdmin->can('update', $this->vessel2))->toBeTrue();
    });

    it('denies VESSEL_OWNER viewer to update vessels', function (): void {
        expect($this->vesselOwnerViewer->can('update', $this->vessel))->toBeFalse();
        expect($this->vesselOwnerViewer->can('update', $this->vessel2))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM viewer to update vessels', function (): void {
        expect($this->portzappViewer->can('update', $this->vessel))->toBeFalse();
        expect($this->portzappViewer->can('update', $this->vessel2))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to update vessels', function (): void {
        expect($this->shippingAgencyAdmin->can('update', $this->vessel))->toBeFalse();
        expect($this->shippingAgencyViewer->can('update', $this->vessel))->toBeFalse();
    });
});

describe('VesselPolicy delete', function (): void {
    it('allows VESSEL_OWNER admin to delete vessels', function (): void {
        expect($this->vesselOwnerAdmin->can('delete', $this->vessel))->toBeTrue();
        expect($this->vesselOwnerAdmin->can('delete', $this->vessel2))->toBeTrue();
    });

    it('allows PORTZAPP_TEAM admin to delete vessels', function (): void {
        expect($this->portzappAdmin->can('delete', $this->vessel))->toBeTrue();
        expect($this->portzappAdmin->can('delete', $this->vessel2))->toBeTrue();
    });

    it('denies VESSEL_OWNER viewer to delete vessels', function (): void {
        expect($this->vesselOwnerViewer->can('delete', $this->vessel))->toBeFalse();
        expect($this->vesselOwnerViewer->can('delete', $this->vessel2))->toBeFalse();
    });

    it('denies PORTZAPP_TEAM viewer to delete vessels', function (): void {
        expect($this->portzappViewer->can('delete', $this->vessel))->toBeFalse();
        expect($this->portzappViewer->can('delete', $this->vessel2))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to delete vessels', function (): void {
        expect($this->shippingAgencyAdmin->can('delete', $this->vessel))->toBeFalse();
        expect($this->shippingAgencyViewer->can('delete', $this->vessel))->toBeFalse();
    });
});

describe('VesselPolicy restore and forceDelete', function (): void {
    it('denies all users to restore vessels', function (): void {
        expect($this->portzappAdmin->can('restore', $this->vessel))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('restore', $this->vessel))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('restore', $this->vessel))->toBeFalse();
    });

    it('denies all users to force delete vessels', function (): void {
        expect($this->portzappAdmin->can('forceDelete', $this->vessel))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('forceDelete', $this->vessel))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('forceDelete', $this->vessel))->toBeFalse();
    });
});
