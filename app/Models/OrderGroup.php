<?php

namespace App\Models;

use App\Enums\OrderGroupStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderGroup extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'group_number',
        'order_id',
        'agency_organization_id',
        'status',
        'subtotal_amount',
        'accepted_at',
        'rejected_at',
        'accepted_by_user_id',
        'response_notes',
        'rejection_reason',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function shippingAgencyOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'agency_organization_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'order_service')
            ->withPivot('quantity', 'unit_price', 'total_price')
            ->withTimestamps();
    }

    public function calculateSubtotal(): float
    {
        return $this->services()->sum('order_service.total_price');
    }

    public function acceptedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by_user_id');
    }

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'rejected_at' => 'datetime',
            'status' => OrderGroupStatus::class,
        ];
    }
}
