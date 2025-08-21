<?php

namespace App\Enums;

enum OnboardingStatus: string
{
    case PENDING = 'pending';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';

    public static function labels(): array
    {
        return [
            self::PENDING->value => 'Pending',
            self::IN_PROGRESS->value => 'In Progress',
            self::COMPLETED->value => 'Completed',
        ];
    }
}
