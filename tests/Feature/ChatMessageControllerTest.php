<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\ChatMessage;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Organization;
use App\Models\Port;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Support\Facades\Event;

beforeEach(function (): void {
    Event::fake();

    // Create organizations
    $this->vesselOwnerOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::VESSEL_OWNER,
    ]);

    $this->shippingAgencyOrg = Organization::factory()->create([
        'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
    ]);

    // Create users
    $this->vesselOwner = User::factory()->create(['current_organization_id' => $this->vesselOwnerOrg->id]);
    $this->vesselOwner->organizations()->attach($this->vesselOwnerOrg, ['role' => UserRoles::ADMIN]);

    $this->agencyUser = User::factory()->create(['current_organization_id' => $this->shippingAgencyOrg->id]);
    $this->agencyUser->organizations()->attach($this->shippingAgencyOrg, ['role' => UserRoles::ADMIN]);

    // Create test data
    $port = Port::factory()->create();
    $vessel = Vessel::factory()->create(['organization_id' => $this->vesselOwnerOrg->id]);

    $this->order = Order::factory()->create([
        'placed_by_user_id' => $this->vesselOwner->id,
        'placed_by_organization_id' => $this->vesselOwnerOrg->id,
        'vessel_id' => $vessel->id,
        'port_id' => $port->id,
    ]);

    $this->orderGroup = OrderGroup::factory()->create([
        'order_id' => $this->order->id,
        'fulfilling_organization_id' => $this->shippingAgencyOrg->id,
    ]);
});

it('allows vessel owner to send chat messages', function (): void {
    $this->actingAs($this->vesselOwner)
        ->post(route('order-groups.messages.store', $this->orderGroup), [
            'message' => 'Hello from vessel owner',
        ])
        ->assertRedirect();

    expect(ChatMessage::count())->toBe(1);
    expect(ChatMessage::first()->message)->toBe('Hello from vessel owner');
    expect(ChatMessage::first()->user_id)->toBe($this->vesselOwner->id);
    expect(ChatMessage::first()->order_group_id)->toBe($this->orderGroup->id);
});

it('allows agency user to send chat messages', function (): void {
    $this->actingAs($this->agencyUser)
        ->post(route('order-groups.messages.store', $this->orderGroup), [
            'message' => 'Hello from agency',
        ])
        ->assertRedirect();

    expect(ChatMessage::count())->toBe(1);
    expect(ChatMessage::first()->message)->toBe('Hello from agency');
    expect(ChatMessage::first()->user_id)->toBe($this->agencyUser->id);
});

it('prevents unauthorized users from accessing chat', function (): void {
    $unauthorizedUser = User::factory()->create();

    $this->actingAs($unauthorizedUser)
        ->get(route('order-groups.messages.index', $this->orderGroup))
        ->assertForbidden();

    $this->actingAs($unauthorizedUser)
        ->post(route('order-groups.messages.store', $this->orderGroup), [
            'message' => 'Unauthorized message',
        ])
        ->assertForbidden();
});

it('returns chat messages for authorized users', function (): void {
    ChatMessage::factory()->create([
        'order_group_id' => $this->orderGroup->id,
        'user_id' => $this->vesselOwner->id,
        'message' => 'Test message',
    ]);

    $this->actingAs($this->vesselOwner)
        ->get(route('order-groups.messages.index', $this->orderGroup))
        ->assertRedirect()
        ->assertSessionHas('messages');

    expect(session('messages'))->toHaveCount(1);
    expect(session('messages')->first()->message)->toBe('Test message');
    expect(session('messages')->first()->user)->not->toBeNull();
});
