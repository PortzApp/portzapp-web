import React from 'react';
import { ChevronRight, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/contexts/onboarding-context';

interface BreadcrumbStep {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

const createSteps: BreadcrumbStep[] = [
    {
        id: 'choose-action',
        label: 'Getting Started',
        description: 'Choose how to proceed',
        icon: <Circle className="w-4 h-4" />
    },
    {
        id: 'create-organization',
        label: 'Organization Setup',
        description: 'Create your organization',
        icon: <Circle className="w-4 h-4" />
    },
    {
        id: 'invite-members',
        label: 'Invite Team',
        description: 'Add team members',
        icon: <Circle className="w-4 h-4" />
    },
    {
        id: 'complete',
        label: 'Complete',
        description: 'All set up',
        icon: <Check className="w-4 h-4" />
    }
];

const joinSteps: BreadcrumbStep[] = [
    {
        id: 'choose-action',
        label: 'Getting Started',
        description: 'Choose how to proceed',
        icon: <Circle className="w-4 h-4" />
    },
    {
        id: 'join-organization',
        label: 'Join Organization',
        description: 'Request to join',
        icon: <Circle className="w-4 h-4" />
    },
    {
        id: 'complete',
        label: 'Complete',
        description: 'All set up',
        icon: <Check className="w-4 h-4" />
    }
];

interface OnboardingBreadcrumbsProps {
    className?: string;
    variant?: 'horizontal' | 'vertical';
    showDescriptions?: boolean;
}

export default function OnboardingBreadcrumbs({ 
    className, 
    variant = 'horizontal', 
    showDescriptions = false 
}: OnboardingBreadcrumbsProps) {
    const { state, setStep, canGoPrevious } = useOnboarding();
    const { currentStep } = state;

    // Determine which step sequence to use
    const steps = currentStep === 'join-organization' ? joinSteps : createSteps;
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStepIndex) return 'completed';
        if (stepIndex === currentStepIndex) return 'current';
        return 'upcoming';
    };

    const handleStepClick = (step: BreadcrumbStep, stepIndex: number) => {
        // Allow navigation only to previous completed steps
        if (stepIndex < currentStepIndex && canGoPrevious()) {
            setStep(step.id as 'choose-action' | 'create-organization' | 'join-organization' | 'invite-members' | 'complete');
        }
    };

    if (variant === 'vertical') {
        return (
            <nav className={cn('flex flex-col space-y-4', className)} aria-label="Onboarding progress">
                {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isClickable = index < currentStepIndex && canGoPrevious();

                    return (
                        <div key={step.id} className="flex items-start">
                            <div className="flex flex-col items-center mr-4">
                                <button
                                    onClick={() => handleStepClick(step, index)}
                                    disabled={!isClickable}
                                    className={cn(
                                        'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                                        status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                                        status === 'current' && 'border-primary bg-primary/10 text-primary',
                                        status === 'upcoming' && 'border-muted-foreground/30 text-muted-foreground',
                                        isClickable && 'hover:bg-primary/20 cursor-pointer'
                                    )}
                                >
                                    {status === 'completed' ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        step.icon
                                    )}
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        'w-px h-8 mt-2',
                                        status === 'completed' ? 'bg-primary' : 'bg-muted-foreground/30'
                                    )} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-sm font-medium',
                                    status === 'current' && 'text-primary',
                                    status === 'completed' && 'text-foreground',
                                    status === 'upcoming' && 'text-muted-foreground'
                                )}>
                                    {step.label}
                                </p>
                                {showDescriptions && step.description && (
                                    <p className={cn(
                                        'text-xs mt-1',
                                        status === 'current' && 'text-primary/70',
                                        status === 'completed' && 'text-muted-foreground',
                                        status === 'upcoming' && 'text-muted-foreground/70'
                                    )}>
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </nav>
        );
    }

    return (
        <nav className={cn('flex items-center justify-center', className)} aria-label="Onboarding progress">
            {steps.map((step, index) => {
                const status = getStepStatus(index);
                const isClickable = index < currentStepIndex && canGoPrevious();

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex items-center">
                            <button
                                onClick={() => handleStepClick(step, index)}
                                disabled={!isClickable}
                                className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                                    status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                                    status === 'current' && 'border-primary bg-primary/10 text-primary',
                                    status === 'upcoming' && 'border-muted-foreground/30 text-muted-foreground',
                                    isClickable && 'hover:bg-primary/20 cursor-pointer'
                                )}
                                title={step.description}
                            >
                                {status === 'completed' ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    step.icon
                                )}
                            </button>
                            <span className={cn(
                                'ml-2 text-sm font-medium',
                                status === 'current' && 'text-primary',
                                status === 'completed' && 'text-foreground',
                                status === 'upcoming' && 'text-muted-foreground'
                            )}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <ChevronRight className={cn(
                                'w-4 h-4 mx-4',
                                status === 'completed' ? 'text-primary' : 'text-muted-foreground/50'
                            )} />
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

// Progress indicator variant
interface OnboardingProgressProps {
    className?: string;
}

export function OnboardingProgress({ className }: OnboardingProgressProps) {
    const { state } = useOnboarding();
    const { currentStep } = state;

    const steps = currentStep === 'join-organization' ? joinSteps : createSteps;
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className={cn('w-full', className)}>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
                <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}