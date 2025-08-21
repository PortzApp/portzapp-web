import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { JoinRequest } from '@/types';

interface JoinRequestWithdrawalDialogProps {
    joinRequest: JoinRequest;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function JoinRequestWithdrawalDialog({
    joinRequest,
    isOpen,
    onClose,
    onSuccess,
}: JoinRequestWithdrawalDialogProps) {
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const handleWithdraw = async () => {
        if (isWithdrawing) return;

        setIsWithdrawing(true);

        try {
            await new Promise<void>((resolve, reject) => {
                router.delete(`/api/join-requests/${joinRequest.id}`, {
                    onSuccess: () => {
                        toast.success('Request Withdrawn', {
                            description: `Your join request to ${joinRequest.organization?.name} has been withdrawn.`,
                        });
                        onClose();
                        onSuccess?.();
                        resolve();
                    },
                    onError: (errors) => {
                        const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to withdraw request';
                        toast.error('Withdrawal Failed', {
                            description: errorMessage,
                        });
                        reject(new Error(errorMessage));
                    },
                });
            });
        } catch (error) {
            // Error already handled in onError callback
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <AlertDialogTitle>Withdraw Join Request</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            Are you sure you want to withdraw your join request to{' '}
                            <span className="font-semibold">{joinRequest.organization?.name}</span>?
                        </p>
                        <p className="text-sm">
                            This action cannot be undone. You'll need to submit a new request 
                            if you want to join this organization in the future.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isWithdrawing}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleWithdraw}
                        disabled={isWithdrawing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isWithdrawing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Withdrawing...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Withdraw Request
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Trigger button component for convenience
interface WithdrawRequestButtonProps {
    joinRequest: JoinRequest;
    onSuccess?: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'default' | 'lg';
    disabled?: boolean;
}

export function WithdrawRequestButton({
    joinRequest,
    onSuccess,
    variant = 'outline',
    size = 'sm',
    disabled = false,
}: WithdrawRequestButtonProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (joinRequest.status !== 'pending') {
        return null; // Only show withdraw button for pending requests
    }

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={() => setIsDialogOpen(true)}
                disabled={disabled}
                className="text-destructive hover:text-destructive"
            >
                <Trash2 className="h-3 w-3 mr-1" />
                Withdraw
            </Button>

            <JoinRequestWithdrawalDialog
                joinRequest={joinRequest}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={onSuccess}
            />
        </>
    );
}