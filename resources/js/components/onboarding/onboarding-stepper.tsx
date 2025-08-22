import { useOnboarding } from '@/contexts/onboarding-context';

import { cn } from '@/lib/utils';

import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';

interface OnboardingStep {
    step: number;
    id: string;
    title: string;
    description: string;
}

const createSteps: OnboardingStep[] = [
    {
        step: 1,
        id: 'choose-action',
        title: 'Getting Started',
        description: 'Choose how to proceed',
    },
    {
        step: 2,
        id: 'create-organization',
        title: 'Organization Setup',
        description: 'Create your organization',
    },
    {
        step: 3,
        id: 'invite-members',
        title: 'Invite Team',
        description: 'Add team members',
    },
    {
        step: 4,
        id: 'complete',
        title: 'Complete',
        description: 'All set up',
    },
];

const joinSteps: OnboardingStep[] = [
    {
        step: 1,
        id: 'choose-action',
        title: 'Getting Started',
        description: 'Choose how to proceed',
    },
    {
        step: 2,
        id: 'join-organization',
        title: 'Join Organization',
        description: 'Request to join',
    },
    {
        step: 3,
        id: 'complete',
        title: 'Complete',
        description: 'All set up',
    },
];

interface OnboardingStepperProps {
    className?: string;
}

export default function OnboardingStepper({ className }: OnboardingStepperProps) {
    const { state, setStep, canGoPrevious } = useOnboarding();
    const { currentStep } = state;

    // Determine which step sequence to use
    const steps = currentStep === 'join-organization' ? joinSteps : createSteps;
    const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

    // Handle step click for navigation
    const handleStepClick = (stepId: string, stepIndex: number) => {
        // Allow navigation only to previous completed steps
        if (stepIndex < currentStepIndex && canGoPrevious()) {
            setStep(stepId as 'choose-action' | 'create-organization' | 'join-organization' | 'invite-members' | 'complete');
        }
    };

    return (
        <div className={cn('space-y-8 text-center', className)}>
            <Stepper value={currentStepIndex + 1}>
                {steps.map(({ step, id, title, description }, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isClickable = index < currentStepIndex && canGoPrevious();

                    return (
                        <StepperItem key={step} step={step} completed={isCompleted} disabled={!isClickable} className="relative flex-1 flex-col!">
                            <StepperTrigger className="flex-col gap-3 rounded" onClick={() => (isClickable ? handleStepClick(id, index) : undefined)}>
                                <StepperIndicator />
                                <div className="space-y-0.5 px-2">
                                    <StepperTitle>{title}</StepperTitle>
                                    <StepperDescription className="max-sm:hidden">{description}</StepperDescription>
                                </div>
                            </StepperTrigger>
                            {step < steps.length && (
                                <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                            )}
                        </StepperItem>
                    );
                })}
            </Stepper>
        </div>
    );
}
