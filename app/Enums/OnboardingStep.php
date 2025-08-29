<?php

namespace App\Enums;

enum OnboardingStep: string
{
    case WELCOME = 'welcome';
    case ORGANIZATION = 'organization';
    case INVITE = 'invite';
    case COMPLETE = 'complete';

    public static function labels(): array
    {
        return [
            self::WELCOME->value => 'Welcome',
            self::ORGANIZATION->value => 'Organization Setup',
            self::INVITE->value => 'Invite Members',
            self::COMPLETE->value => 'Complete',
        ];
    }

    /**
     * Get the ordered progression of steps
     */
    public static function stepOrder(): array
    {
        return [
            self::WELCOME,
            self::ORGANIZATION,
            self::INVITE,
            self::COMPLETE,
        ];
    }

    /**
     * Check if this step can be accessed based on current step
     */
    public function canAccessFrom(?OnboardingStep $currentStep): bool
    {
        if ($currentStep === null) {
            return $this === self::WELCOME;
        }

        $stepOrder = self::stepOrder();
        $currentIndex = array_search($currentStep, $stepOrder, true);
        $thisIndex = array_search($this, $stepOrder, true);

        // Can access current step, previous steps, or the next step
        return $thisIndex <= $currentIndex + 1;
    }

    /**
     * Get the next step in the progression
     */
    public function next(): ?OnboardingStep
    {
        $stepOrder = self::stepOrder();
        $currentIndex = array_search($this, $stepOrder, true);

        if ($currentIndex === false || $currentIndex >= count($stepOrder) - 1) {
            return null;
        }

        return $stepOrder[$currentIndex + 1];
    }

    /**
     * Get the previous step in the progression
     */
    public function previous(): ?OnboardingStep
    {
        $stepOrder = self::stepOrder();
        $currentIndex = array_search($this, $stepOrder, true);

        if ($currentIndex === false || $currentIndex <= 0) {
            return null;
        }

        return $stepOrder[$currentIndex - 1];
    }
}
