<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderWizardCategorySelection extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'session_id',
        'service_category_id',
        'order_index',
    ];

    protected $casts = [
        'order_index' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(OrderWizardSession::class);
    }

    public function serviceCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class);
    }
}
