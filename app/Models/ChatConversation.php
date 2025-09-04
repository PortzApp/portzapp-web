<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatConversation extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'order_group_id',
        'last_message_id',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    public function orderGroup(): BelongsTo
    {
        return $this->belongsTo(OrderGroup::class);
    }

    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'last_message_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id')
            ->whereNull('deleted_at')
            ->orderBy('created_at');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ChatParticipant::class, 'conversation_id');
    }
}
