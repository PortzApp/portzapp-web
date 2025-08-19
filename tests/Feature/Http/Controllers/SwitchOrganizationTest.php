<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\User;

beforeEach(function (): void {
    // Create organizations
    $this->organization1 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        'name' => 'First Organization',
    ]);

    $this->organization2 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        'name' => 'Second Organization',
    ]);

    $this->organization3 = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::PORTZAPP_TEAM,
        'name' => 'Third Organization',
    ]);

    // Create user with multiple organization memberships
    $this->user = User::factory()->create([
        'current_organization_id' => $this->organization1->id,
    ]);

    // Attach user to multiple organizations
    $this->user->organizations()->attach($this->organization1, ['role' => UserRoles::ADMIN]);
    $this->user->organizations()->attach($this->organization2, ['role' => UserRoles::VIEWER]);
    $this->user->organizations()->attach($this->organization3, ['role' => UserRoles::ADMIN]);

    // Create user with single organization membership
    $this->singleOrgUser = User::factory()->create([
        'current_organization_id' => $this->organization1->id,
    ]);
    $this->singleOrgUser->organizations()->attach($this->organization1, ['role' => UserRoles::ADMIN]);

    // Create user not a member of any target organization
    $this->nonMemberUser = User::factory()->create([
        'current_organization_id' => null,
    ]);
});

describe('SwitchOrganization', function (): void {
    it('allows user to switch to organization they belong to', function (): void {
        expect($this->user->current_organization_id)->toBe($this->organization1->id);

        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization2->id,
            ]);

        $response->assertRedirect();

        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization2->id);
    });

    it('allows switching between multiple organizations', function (): void {
        // Switch to organization 2
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization2->id,
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization2->id);

        // Switch to organization 3
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization3->id,
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization3->id);

        // Switch back to organization 1
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization1->id,
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization1->id);
    });

    it('validates that organization_id is required', function (): void {
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), []);

        $response->assertSessionHasErrors('organization_id');

        // Current organization should remain unchanged
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization1->id);
    });

    it('validates that organization exists', function (): void {
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => 99999, // Non-existent organization
            ]);

        $response->assertSessionHasErrors('organization_id');

        // Current organization should remain unchanged
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization1->id);
    });

    it('prevents switching to organization user is not a member of', function (): void {
        $nonMemberOrg = Organization::factory()->create([
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $nonMemberOrg->id,
            ]);

        $response->assertSessionHasErrors('organization_id');

        // Current organization should remain unchanged
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization1->id);
    });

    it('allows user with no current organization to set one', function (): void {
        $userWithoutCurrentOrg = User::factory()->create([
            'current_organization_id' => null,
        ]);
        $userWithoutCurrentOrg->organizations()->attach($this->organization1, ['role' => UserRoles::ADMIN]);

        $response = $this->actingAs($userWithoutCurrentOrg)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization1->id,
            ]);

        $response->assertRedirect();

        $userWithoutCurrentOrg->refresh();
        expect($userWithoutCurrentOrg->current_organization_id)->toBe($this->organization1->id);
    });

    it('redirects unauthenticated users to login', function (): void {
        $response = $this->put(route('user.current-organization.update'), [
            'organization_id' => $this->organization1->id,
        ]);

        $response->assertRedirect(route('login'));
    });

    it('returns back to previous page after successful switch', function (): void {
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization2->id,
            ]);

        $response->assertRedirect();
    });

    it('persists organization switch in database', function (): void {
        $originalUserId = $this->user->id;
        $targetOrgId = $this->organization2->id;

        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $targetOrgId,
            ]);

        $response->assertRedirect();

        // Verify the change is persisted in the database
        $this->assertDatabaseHas('users', [
            'id' => $originalUserId,
            'current_organization_id' => $targetOrgId,
        ]);
    });

    it('works with different organization business types', function (): void {
        // Test switching to shipping agency
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization1->id, // SHIPPING_AGENCY
            ]);
        $response->assertRedirect();

        // Test switching to vessel owner
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization2->id, // VESSEL_OWNER
            ]);
        $response->assertRedirect();

        // Test switching to portzapp team
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization3->id, // PORTZAPP_TEAM
            ]);
        $response->assertRedirect();

        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization3->id);
    });

    it('handles edge case with organization validation timing', function (): void {
        // Test rapid switching requests
        $response1 = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization2->id,
            ]);

        $response2 = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => $this->organization3->id,
            ]);

        $response1->assertRedirect();
        $response2->assertRedirect();

        // Final organization should be the last valid request
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization3->id);
    });

    it('validates organization_id as integer', function (): void {
        $response = $this->actingAs($this->user)
            ->put(route('user.current-organization.update'), [
                'organization_id' => 'invalid_string',
            ]);

        $response->assertSessionHasErrors('organization_id');

        // Current organization should remain unchanged
        $this->user->refresh();
        expect($this->user->current_organization_id)->toBe($this->organization1->id);
    });
});
