<?php

namespace App\Enums;

enum VesselType: string
{
    case CARGO = 'cargo';
    case TANKER = 'tanker';
    case CONTAINER = 'container';

    public function label(): string
    {
        return match ($this) {
            self::CARGO => 'Cargo',
            self::TANKER => 'Tanker',
            self::CONTAINER => 'Container',
        };
    }
}
