import React from 'react';
import { cn } from '@/lib/utils';

// Smooth transition wrapper for form elements
interface SmoothTransitionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    from?: 'top' | 'bottom' | 'left' | 'right' | 'scale' | 'fade';
}

export function SmoothTransition({ 
    children, 
    className, 
    delay = 0, 
    duration = 300,
    from = 'fade'
}: SmoothTransitionProps) {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const getTransitionClass = () => {
        const baseClass = `transition-all duration-${duration} ease-out`;
        
        if (!isVisible) {
            switch (from) {
                case 'top':
                    return `${baseClass} transform -translate-y-4 opacity-0`;
                case 'bottom':
                    return `${baseClass} transform translate-y-4 opacity-0`;
                case 'left':
                    return `${baseClass} transform -translate-x-4 opacity-0`;
                case 'right':
                    return `${baseClass} transform translate-x-4 opacity-0`;
                case 'scale':
                    return `${baseClass} transform scale-95 opacity-0`;
                case 'fade':
                default:
                    return `${baseClass} opacity-0`;
            }
        }
        
        return `${baseClass} transform translate-x-0 translate-y-0 scale-100 opacity-100`;
    };

    return (
        <div className={cn(getTransitionClass(), className)}>
            {children}
        </div>
    );
}

// Staggered animation for lists
interface StaggeredAnimationProps {
    children: React.ReactNode[];
    staggerDelay?: number;
    className?: string;
}

export function StaggeredAnimation({ 
    children, 
    staggerDelay = 100,
    className 
}: StaggeredAnimationProps) {
    return (
        <div className={className}>
            {React.Children.map(children, (child, index) => (
                <SmoothTransition 
                    key={index} 
                    delay={index * staggerDelay}
                    from="top"
                >
                    {child}
                </SmoothTransition>
            ))}
        </div>
    );
}

// Hover effect wrapper for interactive elements
interface HoverEffectProps {
    children: React.ReactNode;
    className?: string;
    scale?: number;
    lift?: boolean;
    glow?: boolean;
}

export function HoverEffect({ 
    children, 
    className, 
    scale = 1.02, 
    lift = false,
    glow = false 
}: HoverEffectProps) {
    return (
        <div 
            className={cn(
                'transition-all duration-200 ease-out cursor-pointer',
                lift && 'hover:shadow-lg hover:-translate-y-1',
                glow && 'hover:shadow-primary/20',
                className
            )}
            style={{
                transform: 'scale(1)',
                '--hover-scale': scale
            } as React.CSSProperties}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(${scale})`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            {children}
        </div>
    );
}

// Pulse animation for loading states
interface PulseProps {
    children: React.ReactNode;
    className?: string;
    intensity?: 'subtle' | 'normal' | 'strong';
}

export function Pulse({ children, className, intensity = 'normal' }: PulseProps) {
    const intensityMap = {
        subtle: 'animate-pulse [animation-duration:3s]',
        normal: 'animate-pulse [animation-duration:2s]',
        strong: 'animate-pulse [animation-duration:1s]'
    };

    return (
        <div className={cn(intensityMap[intensity], className)}>
            {children}
        </div>
    );
}

// Focus ring animation
interface FocusRingProps {
    children: React.ReactNode;
    className?: string;
    color?: 'primary' | 'green' | 'red' | 'blue';
}

export function FocusRing({ children, className, color = 'primary' }: FocusRingProps) {
    const colorMap = {
        primary: 'focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary',
        green: 'focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500',
        red: 'focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500',
        blue: 'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500'
    };

    return (
        <div className={cn(
            'transition-all duration-200 ease-out rounded-md',
            colorMap[color],
            className
        )}>
            {children}
        </div>
    );
}

// Success/Error state transitions
interface StateTransitionProps {
    state: 'idle' | 'success' | 'error' | 'loading';
    children: React.ReactNode;
    className?: string;
}

export function StateTransition({ state, children, className }: StateTransitionProps) {
    const stateClasses = {
        idle: 'border-border',
        success: 'border-green-500 bg-green-50/50',
        error: 'border-red-500 bg-red-50/50',
        loading: 'border-primary bg-primary/5'
    };

    return (
        <div className={cn(
            'transition-all duration-300 ease-out border-2 rounded-lg',
            stateClasses[state],
            className
        )}>
            {children}
        </div>
    );
}

// Slide in/out animations for step transitions
interface SlideTransitionProps {
    isVisible: boolean;
    direction?: 'left' | 'right';
    children: React.ReactNode;
    className?: string;
}

export function SlideTransition({ 
    isVisible, 
    direction = 'right', 
    children, 
    className 
}: SlideTransitionProps) {
    return (
        <div 
            className={cn(
                'transition-all duration-500 ease-out',
                isVisible ? 'translate-x-0 opacity-100' : 
                direction === 'right' ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0',
                className
            )}
        >
            {children}
        </div>
    );
}