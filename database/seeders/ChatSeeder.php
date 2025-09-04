<?php

namespace Database\Seeders;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatMessageRead;
use App\Models\ChatParticipant;
use App\Models\OrderGroup;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable events during seeding to prevent broadcasting errors
        \Illuminate\Support\Facades\Event::fake();

        // Get order groups with their organizations that have users
        $orderGroups = OrderGroup::with([
            'order.placedByUser',
            'order.placedByOrganization',
            'fulfillingOrganization.users',
        ])
            ->whereHas('fulfillingOrganization.users')
            ->take(10) // Create conversations for first 10 order groups
            ->get();

        if ($orderGroups->isEmpty()) {
            if ($this->command) {
                $this->command->warn('No order groups found with fulfilling organizations that have users. Skipping chat seeding.');
            }

            return;
        }

        $conversationCount = 0;

        foreach ($orderGroups as $orderGroup) {
            $this->createConversationForOrderGroup($orderGroup);
            $conversationCount++;
        }

        if ($this->command) {
            $this->command->info("Created {$conversationCount} chat conversations with messages");
        }
    }

    private function createConversationForOrderGroup(OrderGroup $orderGroup): void
    {
        DB::transaction(function () use ($orderGroup) {
            // Create conversation
            $conversation = ChatConversation::factory()->create([
                'order_group_id' => $orderGroup->id,
            ]);

            // Add participants
            $vesselOwnerUser = $orderGroup->order->placedByUser;
            $agencyUser = $orderGroup->fulfillingOrganization->users->first();

            // Add vessel owner as participant
            $vesselOwnerParticipant = ChatParticipant::factory()->create([
                'conversation_id' => $conversation->id,
                'user_id' => $vesselOwnerUser->id,
                'organization_id' => $orderGroup->order->placedByOrganization->id,
            ]);

            // Add agency user as participant
            $agencyParticipant = ChatParticipant::factory()->create([
                'conversation_id' => $conversation->id,
                'user_id' => $agencyUser->id,
                'organization_id' => $orderGroup->fulfillingOrganization->id,
            ]);

            // Create conversation messages
            $this->createMessagesForConversation($conversation, $vesselOwnerUser, $agencyUser);
        });
    }

    private function createMessagesForConversation(ChatConversation $conversation, User $vesselOwner, User $agencyUser): void
    {
        $messages = [];

        // Initial message from vessel owner
        $message1 = ChatMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $vesselOwner->id,
            'message' => 'Hi! I wanted to check on the status of our service request. When can we expect the work to begin?',
            'delivered_at' => now()->subDays(2),
        ]);
        $messages[] = $message1;

        // Response from agency
        $message2 = ChatMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $agencyUser->id,
            'message' => 'Hello! Thanks for reaching out. We have your request scheduled for tomorrow morning. Our team will be there by 8 AM.',
            'delivered_at' => now()->subDays(2)->addHours(3),
        ]);
        $messages[] = $message2;

        // Follow-up from vessel owner
        $message3 = ChatMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $vesselOwner->id,
            'message' => 'Perfect! Do you need any special equipment or documentation from our side?',
            'delivered_at' => now()->subDays(1),
        ]);
        $messages[] = $message3;

        // Reply to the follow-up
        $replyMessage = ChatMessage::factory()->reply()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $agencyUser->id,
            'parent_message_id' => $message3->id,
            'delivered_at' => now()->subDays(1)->addHours(2),
        ]);
        $messages[] = $replyMessage;

        // Recent message from agency
        $message4 = ChatMessage::factory()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $agencyUser->id,
            'message' => 'Work completed successfully! Please check and confirm everything is to your satisfaction.',
            'delivered_at' => now()->subHours(4),
        ]);
        $messages[] = $message4;

        // Update conversation with last message
        $lastMessage = $messages[count($messages) - 1];
        $conversation->update([
            'last_message_id' => $lastMessage->id,
            'last_message_at' => $lastMessage->delivered_at,
        ]);

        // Mark some messages as read by vessel owner (simulate read receipts)
        foreach (array_slice($messages, 0, 3) as $message) {
            if ($message->user_id !== $vesselOwner->id) {
                ChatMessageRead::create([
                    'message_id' => $message->id,
                    'user_id' => $vesselOwner->id,
                    'read_at' => $message->delivered_at->addMinutes(fake()->numberBetween(5, 60)),
                ]);
            }
        }

        // Update participant unread counts
        $vesselOwnerUnreadCount = ChatMessage::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $vesselOwner->id)
            ->whereDoesntHave('reads', function ($query) use ($vesselOwner) {
                $query->where('user_id', $vesselOwner->id);
            })
            ->count();

        ChatParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $vesselOwner->id)
            ->update(['unread_count' => $vesselOwnerUnreadCount]);
    }
}
