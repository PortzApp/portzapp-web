import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './button';
import { type VariantProps } from 'class-variance-authority';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    color?: 'primary' | 'muted' | 'white';
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
};

const colorClasses = {
    primary: 'text-primary',
    muted: 'text-muted-foreground',
    white: 'text-white',
};

export default function LoadingSpinner({ size = 'md', className, color = 'primary' }: LoadingSpinnerProps) {
    return (
        <LoaderCircle 
            className={cn(
                'animate-spin',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
        />
    );
}

interface LoadingStateProps {
    isLoading: boolean;
    children: React.ReactNode;
    loadingComponent?: React.ReactNode;
    spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function LoadingState({ 
    isLoading, 
    children, 
    loadingComponent,
    spinnerSize = 'md',
    className 
}: LoadingStateProps) {
    if (isLoading) {
        return (
            <div className={cn('flex items-center justify-center', className)}>
                {loadingComponent || <LoadingSpinner size={spinnerSize} />}
            </div>
        );
    }
    
    return <>{children}</>;
}

interface LoadingOverlayProps {
    isLoading: boolean;
    children: React.ReactNode;
    message?: string;
    spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingOverlay({ isLoading, children, message, spinnerSize = 'lg' }: LoadingOverlayProps) {
    return (
        <div className="relative">
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <div className="flex flex-col items-center space-y-3">
                        <LoadingSpinner size={spinnerSize} />
                        {message && (
                            <p className="text-sm text-muted-foreground font-medium">{message}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Loading button component

interface LoadingButtonProps extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
    spinnerSize?: 'sm' | 'md' | 'lg';
}

export function LoadingButton({ 
    isLoading = false, 
    loadingText, 
    children, 
    spinnerSize = 'sm',
    disabled,
    className,
    variant,
    size,
    ...props 
}: LoadingButtonProps) {
    return (
        <Button
            {...props}
            disabled={isLoading || disabled}
            className={className}
            variant={variant}
            size={size}
        >
            {isLoading && <LoadingSpinner size={spinnerSize} />}
            {isLoading ? loadingText || children : children}
        </Button>
    );
}