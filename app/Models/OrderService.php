<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $id
 * @property int $order_id
 * @property int $service_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\Service $service
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereServiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class OrderService extends Pivot
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'order_service';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'service_id',
        'quantity',
        'unit_price',
        'total_price',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the order that owns the OrderService.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the service that owns the OrderService.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Calculate the total price based on quantity and unit price.
     */
    public function calculateTotalPrice(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically calculate total_price when saving
        static::saving(function ($orderService) {
            if ($orderService->quantity && $orderService->unit_price) {
                $orderService->total_price = $orderService->calculateTotalPrice();
            }
        });
    }
}
