<?php

namespace App\Policies;

use App\Models\ChatConversation;
use App\Models\User;

class ChatConversationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ChatConversation $chatConversation): bool
    {
        return $this->participate($user, $chatConversation);
    }

    /**
     * Determine whether the user can participate in the conversation.
     */
    public function participate(User $user, ChatConversation $chatConversation): bool
    {
        // User must be a participant in the conversation
        return $chatConversation->participants()
            ->where('user_id', $user->id)
            ->whereNull('left_at')
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false; // Conversations are created automatically
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ChatConversation $chatConversation): bool
    {
        return false; // Conversations are managed by the system
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ChatConversation $chatConversation): bool
    {
        return false; // Conversations should not be deleted
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ChatConversation $chatConversation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ChatConversation $chatConversation): bool
    {
        return false;
    }
}
