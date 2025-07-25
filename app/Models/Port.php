<?php

namespace App\Models;

use Database\Factories\PortFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Port extends Model
{
    /** @use HasFactory<PortFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'status',
        'country',
        'city',
        'latitude',
        'longitude',
        'timezone'
    ];
}
