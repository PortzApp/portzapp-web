<?php

namespace App\Enums;

enum UserRoles: string
{
    case VESSEL_OWNER = 'vessel_owner';
    case SHIPPING_AGENCY = 'shipping_agency';
    case ADMIN = 'admin';
}
