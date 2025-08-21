<?php

namespace App\Enums;

enum JoinRequestStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case WITHDRAWN = 'withdrawn';

    public static function labels(): array
    {
        return [
            self::PENDING->value => 'Pending',
            self::APPROVED->value => 'Approved',
            self::REJECTED->value => 'Rejected',
            self::WITHDRAWN->value => 'Withdrawn',
        ];
    }
}
