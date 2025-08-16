<?php

namespace App\Enums;

enum WizardStep: string
{
    case VESSEL_PORT = 'vessel_port';
    case CATEGORIES = 'categories';
    case SERVICES = 'services';
    case REVIEW = 'review';

    public static function labels(): array
    {
        return [
            self::VESSEL_PORT->value => 'Vessel & Port',
            self::CATEGORIES->value => 'Service Categories',
            self::SERVICES->value => 'Service Selection',
            self::REVIEW->value => 'Review & Submit',
        ];
    }

    public function getProgressPercentage(): int
    {
        return match ($this) {
            self::VESSEL_PORT => 25,
            self::CATEGORIES => 50,
            self::SERVICES => 75,
            self::REVIEW => 100,
        };
    }

    public function getStepNumber(): int
    {
        return match ($this) {
            self::VESSEL_PORT => 1,
            self::CATEGORIES => 2,
            self::SERVICES => 3,
            self::REVIEW => 4,
        };
    }
}
