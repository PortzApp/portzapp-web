<?php

namespace App\Models;

use App\Enums\WizardStep;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderWizardSession extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'organization_id',
        'session_name',
        'vessel_id',
        'port_id',
        'current_step',
        'current_category_index',
        'status',
        'completed_at',
        'expires_at',
    ];

    protected $casts = [
        'current_step' => WizardStep::class,
        'current_category_index' => 'integer',
        'completed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

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

    public function categorySelections(): HasMany
    {
        return $this->hasMany(OrderWizardCategorySelection::class, 'session_id')->orderBy('order_index');
    }

    public function serviceSelections(): HasMany
    {
        return $this->hasMany(OrderWizardServiceSelection::class, 'session_id');
    }

    public function isExpired(): bool
    {
        $expiresAt = $this->expires_at;

        return $expiresAt !== null && $expiresAt instanceof \Carbon\Carbon && $expiresAt->isPast();
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function getCurrentStepEnum(): ?WizardStep
    {
        return WizardStep::tryFrom($this->getAttributes()['current_step'] ?? '');
    }

    public function getProgressPercentage(): int
    {
        return $this->getCurrentStepEnum()?->getProgressPercentage() ?? 0;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'draft')
            ->where(function ($q): void {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }
}
