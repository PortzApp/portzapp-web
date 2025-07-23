<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static create(array $array)
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'service_id',
        'vessel_owner_id',
        'price',
        'notes',
        'status',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
