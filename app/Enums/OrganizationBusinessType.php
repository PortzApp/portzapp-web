<?php

namespace App\Enums;

enum OrganizationBusinessType: string
{
    case SHIPPING_AGENCY = 'shipping_agency';
    case VESSEL_OWNER = 'vessel_owner';
    case PORTZAPP_TEAM = 'portzapp_team';

    public function label(): string
    {
        return match ($this) {
            self::SHIPPING_AGENCY => 'Shipping Agency',
            self::VESSEL_OWNER => 'Vessel Owner',
            self::PORTZAPP_TEAM => 'PortzApp Team',
        };
    }
}
