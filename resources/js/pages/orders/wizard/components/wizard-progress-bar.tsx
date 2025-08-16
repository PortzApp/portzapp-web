import type { WizardStep } from '@/types/wizard';

import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';

interface WizardProgressBarProps {
    currentStep: WizardStep;
    className?: string;
}

const steps = [
    { key: 'vessel_port', step: 1, title: 'Vessel & Port', description: 'Select destination and vessel' },
    { key: 'categories', step: 2, title: 'Categories', description: 'Choose service categories' },
    { key: 'services', step: 3, title: 'Services', description: 'Select specific services' },
    { key: 'review', step: 4, title: 'Review', description: 'Review and place order' },
] as const;

export function WizardProgressBar({ currentStep, className }: WizardProgressBarProps) {
    const currentStepIndex = steps.findIndex((step) => step.key === currentStep);
    const activeStepNumber = currentStepIndex + 1;

    return (
        <div className={className}>
            <Stepper value={activeStepNumber}>
                {steps.map(({ step, title, description, key }) => {
                    const isCompleted = step < activeStepNumber;

                    return (
                        <StepperItem key={key} step={step} completed={isCompleted} className="relative flex-1 flex-col!">
                            <StepperTrigger asChild className="flex-col gap-3 rounded">
                                <div className="flex flex-col items-center gap-3">
                                    <StepperIndicator />
                                    <div className="space-y-0.5 px-2 text-center">
                                        <StepperTitle>{title}</StepperTitle>
                                        <StepperDescription className="max-sm:hidden">{description}</StepperDescription>
                                    </div>
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
