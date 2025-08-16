<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderWizardServiceSelection extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'session_id',
        'service_category_id',
        'service_id',
        'organization_id',
        'price_snapshot',
        'notes',
    ];

    protected $casts = [
        'price_snapshot' => 'decimal:2',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(OrderWizardSession::class);
    }

    public function serviceCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
