<?php

namespace App\Models;

use App\Enums\InvitationStatus;
use App\Enums\InvitationType;
use App\Enums\UserRoles;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model
{
    use HasUlids;

    protected $fillable = [
        'type',
        'email',
        'invited_by_user_id',
        'organization_id',
        'role',
        'status',
        'token',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'type' => InvitationType::class,
        'role' => UserRoles::class,
        'status' => InvitationStatus::class,
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function invitedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isPending(): bool
    {
        return $this->status === InvitationStatus::PENDING;
    }

    public function isAccepted(): bool
    {
        return $this->status === InvitationStatus::ACCEPTED;
    }
}
