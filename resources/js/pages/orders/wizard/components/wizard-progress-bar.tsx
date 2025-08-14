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
    const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

    return (
        <nav className={cn('', className)}>
            <ol className="flex w-full items-center">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isUpcoming = index > currentStepIndex;

                    return (
                        <li
                            key={step.key}
                            className={cn('flex w-full items-center', {
                                'text-primary': isCurrent || isCompleted,
                                'text-muted-foreground': isUpcoming,
                            })}
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold', {
                                        'border-primary bg-primary text-primary-foreground': isCompleted,
                                        'border-primary bg-background text-primary': isCurrent,
                                        'border-muted-foreground/30 bg-background text-muted-foreground': isUpcoming,
                                    })}
                                >
                                    {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                                </div>
                                <div className="mt-2 text-center">
                                    <div
                                        className={cn('text-xs font-medium', {
                                            'text-foreground': isCurrent || isCompleted,
                                            'text-muted-foreground': isUpcoming,
                                        })}
                                    >
                                        {step.label}
                                    </div>
                                    <div className="mt-1 max-w-24 text-xs text-muted-foreground">{step.description}</div>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={cn('mx-4 mb-6 h-0.5 flex-1', {
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
