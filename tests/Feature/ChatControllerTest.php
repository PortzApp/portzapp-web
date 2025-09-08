<?php

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatParticipant;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Organization;
use App\Models\Port;
use App\Models\User;
use App\Models\Vessel;
use App\Services\ChatService;
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

    $this->chatService = app(ChatService::class);
});

describe('getOrCreateConversation', function (): void {
    it('creates a conversation for an order group when none exists', function (): void {
        expect(ChatConversation::count())->toBe(0);

        $this->actingAs($this->vesselOwner)
            ->get(route('chat.conversation.get', $this->orderGroup))
            ->assertOk();

        expect(ChatConversation::count())->toBe(1);
        $conversation = ChatConversation::first();
        expect($conversation->order_group_id)->toBe($this->orderGroup->id);
    });

    it('returns existing conversation when one already exists', function (): void {
        // Create a conversation first
        $existingConversation = $this->chatService->getOrCreateConversation($this->orderGroup);

        $this->actingAs($this->vesselOwner)
            ->get(route('chat.conversation.get', $this->orderGroup))
            ->assertOk()
            ->assertJsonPath('id', $existingConversation->id);

        expect(ChatConversation::count())->toBe(1);
    });

    it('automatically adds participants when creating conversation', function (): void {
        $this->actingAs($this->vesselOwner)
            ->get(route('chat.conversation.get', $this->orderGroup))
            ->assertOk();

        $conversation = ChatConversation::first();
        expect($conversation->participants)->toHaveCount(2);

        $participantUserIds = $conversation->participants->pluck('user_id');
        expect($participantUserIds)->toContain($this->vesselOwner->id);
        expect($participantUserIds)->toContain($this->agencyUser->id);
    });

    it('prevents unauthorized users from accessing conversations', function (): void {
        $unauthorizedUser = User::factory()->create();

        $this->actingAs($unauthorizedUser)
            ->get(route('chat.conversation.get', $this->orderGroup))
            ->assertForbidden();
    });
});

describe('sendMessage', function (): void {
    beforeEach(function (): void {
        $this->conversation = $this->chatService->getOrCreateConversation($this->orderGroup);
    });

    it('allows vessel owner to send messages', function (): void {
        expect(ChatMessage::count())->toBe(0);

        $this->actingAs($this->vesselOwner)
            ->post(route('chat.messages.send', $this->conversation), [
                'message' => 'Hello from vessel owner',
            ])
            ->assertRedirect();

        expect(ChatMessage::count())->toBe(1);
        $message = ChatMessage::first();
        expect($message->message)->toBe('Hello from vessel owner');
        expect($message->user_id)->toBe($this->vesselOwner->id);
        expect($message->conversation_id)->toBe($this->conversation->id);
    });

    it('allows agency user to send messages', function (): void {
        $this->actingAs($this->agencyUser)
            ->post(route('chat.messages.send', $this->conversation), [
                'message' => 'Hello from agency',
            ])
            ->assertRedirect();

        expect(ChatMessage::count())->toBe(1);
        $message = ChatMessage::first();
        expect($message->message)->toBe('Hello from agency');
        expect($message->user_id)->toBe($this->agencyUser->id);
    });

    it('prevents unauthorized users from sending messages', function (): void {
        $unauthorizedUser = User::factory()->create();

        $this->actingAs($unauthorizedUser)
            ->post(route('chat.messages.send', $this->conversation), [
                'message' => 'Unauthorized message',
            ])
            ->assertForbidden();

        expect(ChatMessage::count())->toBe(0);
    });

    it('validates message content', function (): void {
        $this->actingAs($this->vesselOwner)
            ->post(route('chat.messages.send', $this->conversation), [
                'message' => '',
            ])
            ->assertSessionHasErrors('message');

        expect(ChatMessage::count())->toBe(0);
    });

    it('allows reply to existing message', function (): void {
        // Create a parent message first
        $parentMessage = $this->chatService->sendMessage(
            $this->conversation,
            $this->vesselOwner,
            'Original message'
        );

        $response = $this->actingAs($this->agencyUser)
            ->post(route('chat.messages.send', $this->conversation), [
                'message' => 'Reply message',
                'parent_message_id' => $parentMessage->id,
            ])
            ->assertRedirect();

        expect(ChatMessage::count())->toBe(2);
        // Get the latest message fresh from database (excluding the parent message)
        $replyMessage = ChatMessage::where('id', '!=', $parentMessage->id)->latest()->first();

        expect($replyMessage->parent_message_id)->toBe($parentMessage->id);
    });

    it('updates conversation last message when sending', function (): void {
        $this->actingAs($this->vesselOwner)
            ->post(route('chat.messages.send', $this->conversation), [
                'message' => 'Test message',
            ]);

        $this->conversation->refresh();
        expect($this->conversation->last_message_id)->toBe(ChatMessage::first()->id);
        expect($this->conversation->last_message_at)->not->toBeNull();
    });
});

describe('markAsRead', function (): void {
    beforeEach(function (): void {
        $this->conversation = $this->chatService->getOrCreateConversation($this->orderGroup);
    });

    it('allows participants to mark messages as read', function (): void {
        // Send a message from vessel owner
        $this->chatService->sendMessage($this->conversation, $this->vesselOwner, 'Test message');

        // Agency user marks messages as read
        $this->actingAs($this->agencyUser)
            ->patch(route('chat.messages.read', $this->conversation))
            ->assertRedirect();

        // Verify participant unread count is reset
        $participant = ChatParticipant::where('conversation_id', $this->conversation->id)
            ->where('user_id', $this->agencyUser->id)
            ->first();
        expect($participant->unread_count)->toBe(0);
        expect($participant->last_read_at)->not->toBeNull();
    });

    it('prevents unauthorized users from marking messages as read', function (): void {
        $unauthorizedUser = User::factory()->create();

        $this->actingAs($unauthorizedUser)
            ->patch(route('chat.messages.read', $this->conversation))
            ->assertForbidden();
    });
});

describe('message loading with relationships', function (): void {
    beforeEach(function (): void {
        $this->conversation = $this->chatService->getOrCreateConversation($this->orderGroup);
    });

    it('returns messages with user relationships', function (): void {
        // Send some messages
        $this->chatService->sendMessage($this->conversation, $this->vesselOwner, 'Message 1');
        $this->chatService->sendMessage($this->conversation, $this->agencyUser, 'Message 2');

        $response = $this->actingAs($this->vesselOwner)
            ->get(route('chat.conversation.get', $this->orderGroup))
            ->assertOk();

        $responseData = $response->json();
        expect($responseData['messages'])->toHaveCount(2);
        expect($responseData['messages'][0]['user'])->toHaveKey('first_name');
        expect($responseData['messages'][1]['user'])->toHaveKey('first_name');
    });

    it('orders messages by creation time', function (): void {
        // Send messages with slight delay
        $message1 = $this->chatService->sendMessage($this->conversation, $this->vesselOwner, 'First message');
        sleep(1);
        $message2 = $this->chatService->sendMessage($this->conversation, $this->agencyUser, 'Second message');

        $response = $this->actingAs($this->vesselOwner)
            ->get(route('chat.conversation.get', $this->orderGroup))
            ->assertOk();

        $messages = $response->json('messages');
        expect($messages[0]['id'])->toBe($message1->id);
        expect($messages[1]['id'])->toBe($message2->id);
    });
});
