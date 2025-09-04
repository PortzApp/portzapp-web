<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatParticipant extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'organization_id',
        'last_read_at',
        'unread_count',
        'joined_at',
        'left_at',
    ];

    protected function casts(): array
    {
        return [
            'last_read_at' => 'datetime',
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
            'unread_count' => 'integer',
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

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
