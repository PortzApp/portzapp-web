<?php

namespace App\Enums;

enum VesselType: string
{
    case BULK_CARRIER = 'bulk_carrier';
    case CAR_CARRIER = 'car_carrier';
    case CONTAINER_SHIP = 'container_ship';
    case DRY_BULK = 'dry_bulk';
    case GAS_CARRIER = 'gas_carrier';
    case NAVAL_SHIPS = 'naval_ships';
    case PASSENGER_SHIPS = 'passenger_ships';
    case TANKER_SHIP = 'tanker_ship';
    case YACHT = 'yacht';

    public function label(): string
    {
        return match ($this) {
            self::BULK_CARRIER => 'Bulk Carrier',
            self::CAR_CARRIER => 'Car Carrier',
            self::CONTAINER_SHIP => 'Container Ship',
            self::DRY_BULK => 'Dry Bulk',
            self::GAS_CARRIER => 'Gas Carrier',
            self::NAVAL_SHIPS => 'Naval Ships',
            self::PASSENGER_SHIPS => 'Passenger Ships',
            self::TANKER_SHIP => 'Tanker Ship',
            self::YACHT => 'Yacht',
        };
    }
}
