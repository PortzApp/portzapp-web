import { Check } from 'lucide-react';

import type { WizardStep } from '@/types/wizard';

import { cn } from '@/lib/utils';

interface WizardProgressBarProps {
    currentStep: WizardStep;
    className?: string;
}

const steps = [
    { key: 'vessel_port', label: 'Vessel & Port', description: 'Select destination and vessel' },
    { key: 'categories', label: 'Categories', description: 'Choose service categories' },
    { key: 'services', label: 'Services', description: 'Select specific services' },
    { key: 'review', label: 'Review', description: 'Review and place order' },
] as const;

export function WizardProgressBar({ currentStep, className }: WizardProgressBarProps) {
    const currentStepIndex = steps.findIndex(step => step.key === currentStep);

    return (
        <nav className={cn('', className)}>
            <ol className=\"flex items-center w-full\">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isUpcoming = index > currentStepIndex;

                    return (
                        <li key={step.key} className={cn('flex items-center w-full', {
                            'text-primary': isCurrent,
                            'text-muted-foreground': isUpcoming,
                            'text-primary': isCompleted,
                        })}>
                            <div className=\"flex flex-col items-center\">
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold',
                                        {
                                            'bg-primary border-primary text-primary-foreground': isCompleted,
                                            'border-primary bg-background text-primary': isCurrent,
                                            'border-muted-foreground/30 bg-background text-muted-foreground': isUpcoming,
                                        }
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className=\"w-4 h-4\" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <div className=\"mt-2 text-center\">
                                    <div className={cn('text-xs font-medium', {
                                        'text-foreground': isCurrent || isCompleted,
                                        'text-muted-foreground': isUpcoming,
                                    })}>
                                        {step.label}
                                    </div>
                                    <div className=\"text-xs text-muted-foreground mt-1 max-w-24\">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                            
                            {index < steps.length - 1 && (
                                <div
                                    className={cn('flex-1 h-0.5 mx-4 mb-6', {
                                        'bg-primary': isCompleted,
                                        'bg-muted-foreground/30': !isCompleted,
                                    })}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}