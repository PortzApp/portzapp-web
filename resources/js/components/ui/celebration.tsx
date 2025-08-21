import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CelebrationProps {
    isVisible: boolean;
    title: string;
    description?: string;
    children?: React.ReactNode;
    onComplete?: () => void;
    duration?: number;
    className?: string;
}

export default function Celebration({ 
    isVisible, 
    title, 
    description, 
    children, 
    onComplete, 
    duration = 3000,
    className 
}: CelebrationProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isVisible) {
            // Show content after brief delay
            const contentTimer = setTimeout(() => setShowContent(true), 200);

            // Auto complete after duration
            if (onComplete && duration > 0) {
                const completeTimer = setTimeout(onComplete, duration);
                return () => {
                    clearTimeout(contentTimer);
                    clearTimeout(completeTimer);
                };
            }

            return () => clearTimeout(contentTimer);
        } else {
            setShowContent(false);
        }
    }, [isVisible, onComplete, duration]);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
            className
        )}>
            {/* Main content */}
            <div className={cn(
                "text-center space-y-6 px-8 py-12 max-w-lg mx-auto transition-all duration-500 transform",
                showContent ? "scale-100 opacity-100" : "scale-90 opacity-0"
            )}>
                {/* Success icon with pulse animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" />
                    <div className="relative mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-600 animate-pulse" />
                    </div>
                </div>

                {/* Title and description */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-foreground animate-fade-in">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-lg text-muted-foreground animate-fade-in animation-delay-200">
                            {description}
                        </p>
                    )}
                </div>

                {/* Additional content */}
                {children && (
                    <div className="animate-fade-in animation-delay-400">
                        {children}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                
                .animation-delay-200 {
                    animation-delay: 200ms;
                }
                
                .animation-delay-400 {
                    animation-delay: 400ms;
                }
            `}</style>
        </div>
    );
}

// Preset celebration components for common use cases
export function SuccessCelebration({ 
    isVisible, 
    onComplete,
    organizationName 
}: { 
    isVisible: boolean; 
    onComplete?: () => void;
    organizationName?: string;
}) {
    return (
        <Celebration
            isVisible={isVisible}
            title="🎉 Success!"
            description={
                organizationName 
                    ? `${organizationName} has been created successfully!` 
                    : "Everything is set up and ready to go!"
            }
            onComplete={onComplete}
            duration={2500}
        />
    );
}

export function InvitationSuccessCelebration({ 
    isVisible, 
    onComplete,
    inviteCount 
}: { 
    isVisible: boolean; 
    onComplete?: () => void;
    inviteCount: number;
}) {
    return (
        <Celebration
            isVisible={isVisible}
            title="📧 Invitations Sent!"
            description={`${inviteCount} invitation${inviteCount !== 1 ? 's' : ''} sent successfully. Your team will receive their invitations shortly.`}
            onComplete={onComplete}
            duration={2500}
        />
    );
}

export function CompletionCelebration({ 
    isVisible, 
    onComplete 
}: { 
    isVisible: boolean; 
    onComplete?: () => void;
}) {
    return (
        <Celebration
            isVisible={isVisible}
            title="🚀 Welcome to PortzApp!"
            description="You're all set up and ready to streamline your port operations."
            onComplete={onComplete}
            duration={3000}
        />
    );
}