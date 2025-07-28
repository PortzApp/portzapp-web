<?php

namespace App\Enums;

enum OrganizationBusinessType: string
{
    case SHIPPING_AGENCY = 'shipping_agency';
    case VESSEL_OWNER = 'vessel_owner';
    case PLATFORM_ADMIN = 'platform_admin';

    public function label(): string
    {
        return match ($this) {
            self::SHIPPING_AGENCY => 'Shipping Agency',
            self::VESSEL_OWNER => 'Vessel Owner',
            self::PLATFORM_ADMIN => 'Platform Admin',
        };
    }
}
