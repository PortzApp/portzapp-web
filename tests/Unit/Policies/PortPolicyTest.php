<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\Port;
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

    // Create PORTZAPP_TEAM users
    $this->portzappAdmin = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappAdmin->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::ADMIN->value]);

    $this->portzappCEO = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappCEO->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::CEO->value]);

    $this->portzappManager = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappManager->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::MANAGER->value]);

    $this->portzappOperations = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappOperations->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::OPERATIONS->value]);

    $this->portzappFinance = User::factory()->create(['current_organization_id' => $this->portzappTeamOrg->id]);
    $this->portzappFinance->organizations()->attach($this->portzappTeamOrg, ['role' => UserRoles::FINANCE->value]);

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

    // Create test port
    $this->port = Port::factory()->create(['name' => 'Test Port']);
});

describe('PortPolicy viewAny', function (): void {
    it('allows PORTZAPP_TEAM users to view any ports', function (): void {
        expect($this->portzappAdmin->can('viewAny', Port::class))->toBeTrue();
        expect($this->portzappCEO->can('viewAny', Port::class))->toBeTrue();
        expect($this->portzappManager->can('viewAny', Port::class))->toBeTrue();
        expect($this->portzappOperations->can('viewAny', Port::class))->toBeTrue();
        expect($this->portzappFinance->can('viewAny', Port::class))->toBeTrue();
        expect($this->portzappViewer->can('viewAny', Port::class))->toBeTrue();
    });

    it('denies VESSEL_OWNER users to view any ports', function (): void {
        expect($this->vesselOwnerAdmin->can('viewAny', Port::class))->toBeFalse();
        expect($this->vesselOwnerViewer->can('viewAny', Port::class))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to view any ports', function (): void {
        expect($this->shippingAgencyAdmin->can('viewAny', Port::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('viewAny', Port::class))->toBeFalse();
    });
});

describe('PortPolicy view', function (): void {
    it('allows PORTZAPP_TEAM users to view ports', function (): void {
        expect($this->portzappAdmin->can('view', $this->port))->toBeTrue();
        expect($this->portzappCEO->can('view', $this->port))->toBeTrue();
        expect($this->portzappManager->can('view', $this->port))->toBeTrue();
        expect($this->portzappOperations->can('view', $this->port))->toBeTrue();
        expect($this->portzappFinance->can('view', $this->port))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->port))->toBeTrue();
    });

    it('denies VESSEL_OWNER users to view ports', function (): void {
        expect($this->vesselOwnerAdmin->can('view', $this->port))->toBeFalse();
        expect($this->vesselOwnerViewer->can('view', $this->port))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to view ports', function (): void {
        expect($this->shippingAgencyAdmin->can('view', $this->port))->toBeFalse();
        expect($this->shippingAgencyViewer->can('view', $this->port))->toBeFalse();
    });
});

describe('PortPolicy create', function (): void {
    it('allows PORTZAPP_TEAM admin to create ports', function (): void {
        expect($this->portzappAdmin->can('create', Port::class))->toBeTrue();
    });

    it('denies PORTZAPP_TEAM non-admin users to create ports', function (): void {
        expect($this->portzappCEO->can('create', Port::class))->toBeFalse();
        expect($this->portzappManager->can('create', Port::class))->toBeFalse();
        expect($this->portzappOperations->can('create', Port::class))->toBeFalse();
        expect($this->portzappFinance->can('create', Port::class))->toBeFalse();
        expect($this->portzappViewer->can('create', Port::class))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to create ports', function (): void {
        expect($this->vesselOwnerAdmin->can('create', Port::class))->toBeFalse();
        expect($this->vesselOwnerViewer->can('create', Port::class))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to create ports', function (): void {
        expect($this->shippingAgencyAdmin->can('create', Port::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('create', Port::class))->toBeFalse();
    });
});

describe('PortPolicy update', function (): void {
    it('allows PORTZAPP_TEAM admin to update ports', function (): void {
        expect($this->portzappAdmin->can('update', $this->port))->toBeTrue();
    });

    it('denies PORTZAPP_TEAM non-admin users to update ports', function (): void {
        expect($this->portzappCEO->can('update', $this->port))->toBeFalse();
        expect($this->portzappManager->can('update', $this->port))->toBeFalse();
        expect($this->portzappOperations->can('update', $this->port))->toBeFalse();
        expect($this->portzappFinance->can('update', $this->port))->toBeFalse();
        expect($this->portzappViewer->can('update', $this->port))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to update ports', function (): void {
        expect($this->vesselOwnerAdmin->can('update', $this->port))->toBeFalse();
        expect($this->vesselOwnerViewer->can('update', $this->port))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to update ports', function (): void {
        expect($this->shippingAgencyAdmin->can('update', $this->port))->toBeFalse();
        expect($this->shippingAgencyViewer->can('update', $this->port))->toBeFalse();
    });
});

describe('PortPolicy delete', function (): void {
    it('allows PORTZAPP_TEAM admin to delete ports', function (): void {
        expect($this->portzappAdmin->can('delete', $this->port))->toBeTrue();
    });

    it('denies PORTZAPP_TEAM non-admin users to delete ports', function (): void {
        expect($this->portzappCEO->can('delete', $this->port))->toBeFalse();
        expect($this->portzappManager->can('delete', $this->port))->toBeFalse();
        expect($this->portzappOperations->can('delete', $this->port))->toBeFalse();
        expect($this->portzappFinance->can('delete', $this->port))->toBeFalse();
        expect($this->portzappViewer->can('delete', $this->port))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to delete ports', function (): void {
        expect($this->vesselOwnerAdmin->can('delete', $this->port))->toBeFalse();
        expect($this->vesselOwnerViewer->can('delete', $this->port))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to delete ports', function (): void {
        expect($this->shippingAgencyAdmin->can('delete', $this->port))->toBeFalse();
        expect($this->shippingAgencyViewer->can('delete', $this->port))->toBeFalse();
    });
});

describe('PortPolicy restore and forceDelete', function (): void {
    it('denies all users to restore ports', function (): void {
        expect($this->portzappAdmin->can('restore', $this->port))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('restore', $this->port))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('restore', $this->port))->toBeFalse();
    });

    it('denies all users to force delete ports', function (): void {
        expect($this->portzappAdmin->can('forceDelete', $this->port))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('forceDelete', $this->port))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('forceDelete', $this->port))->toBeFalse();
    });
});
