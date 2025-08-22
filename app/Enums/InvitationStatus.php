<?php

namespace App\Enums;

enum InvitationStatus: string
{
    case PENDING = 'pending';
    case ACCEPTED = 'accepted';
    case DECLINED = 'declined';
    case EXPIRED = 'expired';
    case CANCELLED = 'cancelled';

    public static function labels(): array
    {
        return [
            self::PENDING->value => 'Pending',
            self::ACCEPTED->value => 'Accepted',
            self::DECLINED->value => 'Declined',
            self::EXPIRED->value => 'Expired',
            self::CANCELLED->value => 'Cancelled',
        ];
    }
}
