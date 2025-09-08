<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatMessage extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'chat_messages';

    protected $fillable = [
        'conversation_id',
        'user_id',
        'parent_message_id',
        'message',
        'message_type',
        'delivered_at',
        'edited_at',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'delivered_at' => 'datetime',
            'edited_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentMessage(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'parent_message_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'parent_message_id')
            ->whereNull('deleted_at')
            ->orderBy('created_at');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(ChatMessageRead::class, 'message_id');
    }

    public function isReadBy(string $userId): bool
    {
        return $this->reads()->where('user_id', $userId)->exists();
    }

    public function getReadAt(string $userId): ?string
    {
        /** @var ChatMessageRead|null $read */
        $read = $this->reads()->where('user_id', $userId)->first();

        if (!$read || !$read->read_at) {
            return null;
        }

        /** @var Carbon $readAt */
        $readAt = $read->read_at;
        return $readAt->format('H:i');
    }

    public function isOwnMessage(string $userId): bool
    {
        return $this->user_id === $userId;
    }
}
