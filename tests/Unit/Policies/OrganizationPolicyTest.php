<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
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

    // Create test organization
    $this->testOrganization = Organization::factory()->create(['name' => 'Test Organization']);
});

describe('OrganizationPolicy viewAny', function (): void {
    it('allows PORTZAPP_TEAM users to view any organizations', function (): void {
        expect($this->portzappAdmin->can('viewAny', Organization::class))->toBeTrue();
        expect($this->portzappCEO->can('viewAny', Organization::class))->toBeTrue();
        expect($this->portzappManager->can('viewAny', Organization::class))->toBeTrue();
        expect($this->portzappOperations->can('viewAny', Organization::class))->toBeTrue();
        expect($this->portzappFinance->can('viewAny', Organization::class))->toBeTrue();
        expect($this->portzappViewer->can('viewAny', Organization::class))->toBeTrue();
    });

    it('denies VESSEL_OWNER users to view any organizations', function (): void {
        expect($this->vesselOwnerAdmin->can('viewAny', Organization::class))->toBeFalse();
        expect($this->vesselOwnerViewer->can('viewAny', Organization::class))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to view any organizations', function (): void {
        expect($this->shippingAgencyAdmin->can('viewAny', Organization::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('viewAny', Organization::class))->toBeFalse();
    });
});

describe('OrganizationPolicy view', function (): void {
    it('allows PORTZAPP_TEAM users to view organizations', function (): void {
        expect($this->portzappAdmin->can('view', $this->testOrganization))->toBeTrue();
        expect($this->portzappCEO->can('view', $this->testOrganization))->toBeTrue();
        expect($this->portzappManager->can('view', $this->testOrganization))->toBeTrue();
        expect($this->portzappOperations->can('view', $this->testOrganization))->toBeTrue();
        expect($this->portzappFinance->can('view', $this->testOrganization))->toBeTrue();
        expect($this->portzappViewer->can('view', $this->testOrganization))->toBeTrue();
    });

    it('denies VESSEL_OWNER users to view organizations', function (): void {
        expect($this->vesselOwnerAdmin->can('view', $this->testOrganization))->toBeFalse();
        expect($this->vesselOwnerViewer->can('view', $this->testOrganization))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to view organizations', function (): void {
        expect($this->shippingAgencyAdmin->can('view', $this->testOrganization))->toBeFalse();
        expect($this->shippingAgencyViewer->can('view', $this->testOrganization))->toBeFalse();
    });
});

describe('OrganizationPolicy create', function (): void {
    it('allows PORTZAPP_TEAM admin to create organizations', function (): void {
        expect($this->portzappAdmin->can('create', Organization::class))->toBeTrue();
    });

    it('denies PORTZAPP_TEAM non-admin users to create organizations', function (): void {
        expect($this->portzappCEO->can('create', Organization::class))->toBeFalse();
        expect($this->portzappManager->can('create', Organization::class))->toBeFalse();
        expect($this->portzappOperations->can('create', Organization::class))->toBeFalse();
        expect($this->portzappFinance->can('create', Organization::class))->toBeFalse();
        expect($this->portzappViewer->can('create', Organization::class))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to create organizations', function (): void {
        expect($this->vesselOwnerAdmin->can('create', Organization::class))->toBeFalse();
        expect($this->vesselOwnerViewer->can('create', Organization::class))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to create organizations', function (): void {
        expect($this->shippingAgencyAdmin->can('create', Organization::class))->toBeFalse();
        expect($this->shippingAgencyViewer->can('create', Organization::class))->toBeFalse();
    });
});

describe('OrganizationPolicy update', function (): void {
    it('allows PORTZAPP_TEAM admin to update organizations', function (): void {
        expect($this->portzappAdmin->can('update', $this->testOrganization))->toBeTrue();
    });

    it('denies PORTZAPP_TEAM non-admin users to update organizations', function (): void {
        expect($this->portzappCEO->can('update', $this->testOrganization))->toBeFalse();
        expect($this->portzappManager->can('update', $this->testOrganization))->toBeFalse();
        expect($this->portzappOperations->can('update', $this->testOrganization))->toBeFalse();
        expect($this->portzappFinance->can('update', $this->testOrganization))->toBeFalse();
        expect($this->portzappViewer->can('update', $this->testOrganization))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to update organizations', function (): void {
        expect($this->vesselOwnerAdmin->can('update', $this->testOrganization))->toBeFalse();
        expect($this->vesselOwnerViewer->can('update', $this->testOrganization))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to update organizations', function (): void {
        expect($this->shippingAgencyAdmin->can('update', $this->testOrganization))->toBeFalse();
        expect($this->shippingAgencyViewer->can('update', $this->testOrganization))->toBeFalse();
    });
});

describe('OrganizationPolicy delete', function (): void {
    it('allows PORTZAPP_TEAM admin to delete organizations', function (): void {
        expect($this->portzappAdmin->can('delete', $this->testOrganization))->toBeTrue();
    });

    it('denies PORTZAPP_TEAM non-admin users to delete organizations', function (): void {
        expect($this->portzappCEO->can('delete', $this->testOrganization))->toBeFalse();
        expect($this->portzappManager->can('delete', $this->testOrganization))->toBeFalse();
        expect($this->portzappOperations->can('delete', $this->testOrganization))->toBeFalse();
        expect($this->portzappFinance->can('delete', $this->testOrganization))->toBeFalse();
        expect($this->portzappViewer->can('delete', $this->testOrganization))->toBeFalse();
    });

    it('denies VESSEL_OWNER users to delete organizations', function (): void {
        expect($this->vesselOwnerAdmin->can('delete', $this->testOrganization))->toBeFalse();
        expect($this->vesselOwnerViewer->can('delete', $this->testOrganization))->toBeFalse();
    });

    it('denies SHIPPING_AGENCY users to delete organizations', function (): void {
        expect($this->shippingAgencyAdmin->can('delete', $this->testOrganization))->toBeFalse();
        expect($this->shippingAgencyViewer->can('delete', $this->testOrganization))->toBeFalse();
    });
});

describe('OrganizationPolicy restore and forceDelete', function (): void {
    it('denies all users to restore organizations', function (): void {
        expect($this->portzappAdmin->can('restore', $this->testOrganization))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('restore', $this->testOrganization))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('restore', $this->testOrganization))->toBeFalse();
    });

    it('denies all users to force delete organizations', function (): void {
        expect($this->portzappAdmin->can('forceDelete', $this->testOrganization))->toBeFalse();
        expect($this->vesselOwnerAdmin->can('forceDelete', $this->testOrganization))->toBeFalse();
        expect($this->shippingAgencyAdmin->can('forceDelete', $this->testOrganization))->toBeFalse();
    });
});
