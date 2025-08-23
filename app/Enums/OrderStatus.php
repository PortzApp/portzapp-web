<?php

namespace App\Enums;

enum OrderStatus: string
{
    case DRAFT = 'draft';
    case PENDING_AGENCY_CONFIRMATION = 'pending_agency_confirmation';
    case PARTIALLY_ACCEPTED = 'partially_accepted';
    case PARTIALLY_REJECTED = 'partially_rejected';
    case CONFIRMED = 'confirmed';
    case IN_PROGRESS = 'in_progress';
    case PARTIALLY_COMPLETED = 'partially_completed';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_AGENCY_CONFIRMATION => 'Pending Agency Confirmation',
            self::PARTIALLY_ACCEPTED => 'Partially Accepted',
            self::PARTIALLY_REJECTED => 'Partially Rejected',
            self::CONFIRMED => 'Confirmed',
            self::IN_PROGRESS => 'In Progress',
            self::PARTIALLY_COMPLETED => 'Partially Completed',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAFT => 'gray',
            self::PENDING_AGENCY_CONFIRMATION => 'yellow',
            self::PARTIALLY_ACCEPTED => 'orange',
            self::PARTIALLY_REJECTED => 'red',
            self::CONFIRMED => 'green',
            self::IN_PROGRESS => 'blue',
            self::PARTIALLY_COMPLETED => 'blue',
            self::COMPLETED => 'green',
            self::CANCELLED => 'red',
        };
    }
}
