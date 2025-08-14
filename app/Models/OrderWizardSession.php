<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderWizardSession extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'organization_id',
        'session_name',
        'vessel_id',
        'port_id',
        'selected_categories',
        'selected_services',
        'current_step',
        'status',
        'completed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'selected_categories' => 'array',
            'selected_services' => 'array',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }

    public function port(): BelongsTo
    {
        return $this->belongsTo(Port::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function getProgressPercentage(): int
    {
        return match ($this->current_step) {
            'vessel_port' => 25,
            'categories' => 50,
            'services' => 75,
            'review' => 100,
            default => 0,
        };
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'draft')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }
}
