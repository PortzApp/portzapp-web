<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageSent;
use App\Http\Requests\SendChatMessageRequest;
use App\Models\OrderGroup;
use Illuminate\Support\Facades\Gate;

class ChatMessageController extends Controller
{
    /**
     * Get chat messages for an order group.
     */
    public function index(OrderGroup $orderGroup)
    {
        Gate::authorize('viewChat', $orderGroup);

        $messages = $orderGroup->chatMessages()
            ->with('user:id,first_name,last_name,email')
            ->orderBy('created_at', 'asc')
            ->get();

        return back()->with([
            'messages' => $messages,
        ]);
    }

    /**
     * Send a new chat message.
     */
    public function store(SendChatMessageRequest $request, OrderGroup $orderGroup)
    {
        Gate::authorize('sendMessage', $orderGroup);

        $message = $orderGroup->chatMessages()->create([
            'user_id' => auth()->id(),
            'message' => $request->validated('message'),
        ]);

        $message->load('user:id,first_name,last_name,email');

        // TEMPORARILY DISABLED - WebSocket functionality disabled in production
        // /** @var \App\Models\ChatMessage $message */
        // broadcast(new ChatMessageSent($message))->toOthers();

        return back()->with([
            'success' => 'Message sent successfully',
            'message' => $message,
        ]);
    }

    /**
     * Mark messages as read for the current user.
     */
    public function markAsRead(OrderGroup $orderGroup)
    {
        Gate::authorize('viewChat', $orderGroup);

        $orderGroup->chatMessages()
            ->where('user_id', '!=', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back()->with([
            'success' => 'Messages marked as read',
        ]);
    }
}
