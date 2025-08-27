<?php

namespace App\Models;

use App\Enums\OrderGroupServiceStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $order_group_id
 * @property string $service_id
 * @property OrderGroupServiceStatus $status
 * @property string|null $notes
 * @property float $price_snapshot
 * @property-read OrderGroup $orderGroup
 * @property-read Service $service
 */
class OrderGroupService extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'order_group_id',
        'service_id',
        'status',
        'notes',
        'price_snapshot',
    ];

    public function orderGroup(): BelongsTo
    {
        return $this->belongsTo(OrderGroup::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    protected function casts(): array
    {
        return [
            'status' => OrderGroupServiceStatus::class,
            'price_snapshot' => 'decimal:2',
        ];
    }
}
