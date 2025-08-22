import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        if (toast.duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 5000);
        }
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearToasts = () => {
        setToasts([]);
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return createPortal(
        <div className="fixed top-0 right-0 z-50 w-full max-w-sm p-4 space-y-2">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => removeToast(toast.id)}
                />
            ))}
        </div>,
        document.body
    );
}

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Enter animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleRemove = () => {
        setIsLeaving(true);
        setTimeout(onRemove, 200);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getBorderColor = () => {
        switch (toast.type) {
            case 'success':
                return 'border-green-500';
            case 'error':
                return 'border-red-500';
            case 'warning':
                return 'border-yellow-500';
            case 'info':
                return 'border-blue-500';
        }
    };

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 bg-background border border-l-4 rounded-lg shadow-lg transition-all duration-200 ease-in-out transform',
                getBorderColor(),
                isVisible && !isLeaving && 'translate-x-0 opacity-100',
                !isVisible && 'translate-x-full opacity-0',
                isLeaving && 'translate-x-full opacity-0 scale-95'
            )}
            style={{ 
                transform: isVisible && !isLeaving ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible && !isLeaving ? 1 : 0
            }}
        >
            <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">
                    {toast.title}
                </div>
                {toast.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                        {toast.description}
                    </div>
                )}
                {toast.action && (
                    <div className="mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toast.action.onClick}
                            className="text-xs"
                        >
                            {toast.action.label}
                        </Button>
                    </div>
                )}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted/50"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}

// Convenience hooks for different toast types
export const useSuccessToast = () => {
    const { addToast } = useToast();
    return (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'success', title, description, ...options });
};

export const useErrorToast = () => {
    const { addToast } = useToast();
    return (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'error', title, description, ...options });
};

export const useInfoToast = () => {
    const { addToast } = useToast();
    return (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'info', title, description, ...options });
};

export const useWarningToast = () => {
    const { addToast } = useToast();
    return (title: string, description?: string, options?: Partial<Toast>) =>
        addToast({ type: 'warning', title, description, ...options });
};