import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';

interface OrderWizardStepperProps {
    currentStep: number;
    className?: string;
}

const steps = [
    {
        step: 1,
        title: 'Port & Vessel',
        description: 'Select destination port and vessel',
    },
    {
        step: 2,
        title: 'Service Categories',
        description: 'Choose required service categories',
    },
    {
        step: 3,
        title: 'Agency Selection',
        description: 'Select agencies and services',
    },
    {
        step: 4,
        title: 'Review & Confirm',
        description: 'Review order details and confirm',
    },
];

export default function OrderWizardStepper({ currentStep, className }: OrderWizardStepperProps) {
    return (
        <div className={className}>
            <Stepper defaultValue={currentStep}>
                {steps.map(({ step, title, description }) => (
                    <StepperItem key={step} step={step} className="not-last:flex-1 max-md:items-start">
                        <StepperTrigger className="rounded max-md:flex-col">
                            <StepperIndicator />
                            <div className="text-center md:text-left">
                                <StepperTitle>{title}</StepperTitle>
                                <StepperDescription className="max-sm:hidden">{description}</StepperDescription>
                            </div>
                        </StepperTrigger>
                        {step < steps.length && <StepperSeparator className="max-md:mt-3.5 md:mx-4" />}
                    </StepperItem>
                ))}
            </Stepper>
        </div>
    );
}
