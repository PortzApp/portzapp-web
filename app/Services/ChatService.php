<?php

namespace App\Services;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatMessageRead;
use App\Models\ChatParticipant;
use App\Models\OrderGroup;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChatService
{
    /**
     * Get or create a conversation for an order group.
     */
    public function getOrCreateConversation(OrderGroup $orderGroup): ChatConversation
    {
        return DB::transaction(function () use ($orderGroup) {
            $conversation = ChatConversation::where('order_group_id', $orderGroup->id)->first();

            if (! $conversation) {
                $conversation = ChatConversation::create([
                    'order_group_id' => $orderGroup->id,
                ]);

                // Add participants: vessel owner and shipping agency
                $this->addParticipant(
                    $conversation,
                    $orderGroup->order->placedByUser,
                    $orderGroup->order->placedByOrganization
                );

                // Add fulfilling organization's first user (if any)
                $fulfillingOrgUser = $orderGroup->fulfillingOrganization->users()->first();
                if ($fulfillingOrgUser) {
                    $this->addParticipant(
                        $conversation,
                        $fulfillingOrgUser,
                        $orderGroup->fulfillingOrganization
                    );
                }
            }

            return $conversation;
        });
    }

    /**
     * Add a participant to a conversation.
     */
    public function addParticipant(ChatConversation $conversation, User $user, $organization): ChatParticipant
    {
        return ChatParticipant::firstOrCreate([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
        ], [
            'organization_id' => $organization->id,
            'joined_at' => now(),
            'unread_count' => 0,
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(
        ChatConversation $conversation,
        User $user,
        string $message,
        ?string $parentMessageId = null
    ): ChatMessage {
        return DB::transaction(function () use ($conversation, $user, $message, $parentMessageId) {
            $chatMessage = new ChatMessage;
            $chatMessage->conversation_id = $conversation->id;
            $chatMessage->user_id = $user->id;
            $chatMessage->parent_message_id = $parentMessageId;
            $chatMessage->message = $message;
            $chatMessage->message_type = 'text';
            $chatMessage->delivered_at = now();
            $chatMessage->save();

            // Update conversation's last message
            $conversation->update([
                'last_message_id' => $chatMessage->id,
                'last_message_at' => now(),
            ]);

            // Increment unread count for other participants
            ChatParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', '!=', $user->id)
                ->increment('unread_count');

            return $chatMessage;
        });
    }

    /**
     * Mark messages as read by a user.
     */
    public function markMessagesAsRead(ChatConversation $conversation, User $user): void
    {
        DB::transaction(function () use ($conversation, $user) {
            // Get unread messages for this user in the conversation
            $unreadMessages = ChatMessage::where('conversation_id', $conversation->id)
                ->where('user_id', '!=', $user->id)
                ->whereDoesntHave('reads', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereNull('deleted_at')
                ->get();

            // Mark all unread messages as read
            foreach ($unreadMessages as $message) {
                ChatMessageRead::firstOrCreate([
                    'message_id' => $message->id,
                    'user_id' => $user->id,
                ], [
                    'read_at' => now(),
                ]);
            }

            // Reset unread count for this participant
            ChatParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', $user->id)
                ->update([
                    'unread_count' => 0,
                    'last_read_at' => now(),
                ]);
        });
    }

    /**
     * Get conversation with messages and participants.
     */
    public function getConversationWithMessages(ChatConversation $conversation): ChatConversation
    {
        return $conversation->load([
            'messages.user',
            'messages.parentMessage',
            'messages.reads',
            'participants.user',
            'participants.organization',
        ]);
    }

    /**
     * Get conversations for a user with unread counts.
     */
    public function getUserConversations(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return ChatConversation::whereHas('participants', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with([
                'lastMessage.user',
                'participants.organization',
                'orderGroup.fulfillingOrganization',
                'orderGroup.order.vessel',
            ])
            ->orderByDesc('last_message_at')
            ->get();
    }
}
