<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int $service_id
 * @property int|null $order_group_id
 * @property int $quantity
 * @property float $unit_price
 * @property float $total_price
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read Service $service
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereServiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereOrderGroupId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderService whereUpdatedAt($value)
 *
 * @mixin Eloquent
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
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'service_id',
        'order_group_id',
        'quantity',
        'unit_price',
        'total_price',
    ];
}
