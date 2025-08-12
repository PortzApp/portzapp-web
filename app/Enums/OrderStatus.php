<?php

namespace App\Enums;

enum OrderStatus: string
{
    case DRAFT = 'draft';
    case PENDING_AGENCY_CONFIRMATION = 'pending_agency_confirmation';
    case PARTIALLY_CONFIRMED = 'partially_confirmed';
    case CONFIRMED = 'confirmed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_AGENCY_CONFIRMATION => 'Pending Agency Confirmation',
            self::PARTIALLY_CONFIRMED => 'Partially Confirmed',
            self::CONFIRMED => 'Confirmed',
            self::CANCELLED => 'Cancelled',
        };
    }
}
