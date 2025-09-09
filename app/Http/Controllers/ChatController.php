<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\OrderGroup;
use App\Services\ChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ChatController extends Controller
{
    public function __construct(
        private ChatService $chatService
    ) {}

    /**
     * Get or create a conversation for an order group.
     */
    public function getOrCreateConversation(OrderGroup $orderGroup)
    {
        // Authorize: user must have access to this order group's chat
        Gate::authorize('viewChat', $orderGroup);

        $conversation = $this->chatService->getOrCreateConversation($orderGroup);

        // Load messages with relationships
        $messages = $conversation->messages()
            ->with(['user', 'reads'])
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'id' => $conversation->id,
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(ChatConversation $conversation, Request $request)
    {
        // Authorize: user must be a participant in the conversation
        Gate::authorize('participate', $conversation);

        $request->validate([
            'message' => 'required|string|max:1000',
            'parent_message_id' => 'nullable|exists:chat_messages,id',
        ]);

        $message = $this->chatService->sendMessage(
            $conversation,
            $request->user(),
            $request->input('message'),
            $request->input('parent_message_id')
        );

        // Load message with relationships for broadcasting
        $message->load('user', 'parentMessage.user', 'reads');

        // TEMPORARILY DISABLED - WebSocket functionality disabled in production
        // // Broadcast message to other participants
        // broadcast(new \App\Events\ChatMessageSent($message))->toOthers();

        return back()->with('success', 'Message sent successfully');
    }

    /**
     * Mark messages as read in a conversation.
     */
    public function markAsRead(ChatConversation $conversation, Request $request)
    {
        Gate::authorize('participate', $conversation);

        $this->chatService->markMessagesAsRead($conversation, $request->user());

        return back()->with('success', 'Messages marked as read');
    }
}
