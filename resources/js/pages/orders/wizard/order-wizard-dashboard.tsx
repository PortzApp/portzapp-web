import { useState } from 'react';

import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Plus, Ship, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

import type { BreadcrumbItem } from '@/types';
import type { OrderWizardSession } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders.index'),
    },
    {
        title: 'Order Wizard',
        href: route('order-wizard.dashboard'),
    },
];

interface OrderWizardDashboardProps {
    sessions: OrderWizardSession[];
}

export default function OrderWizardDashboard({ sessions }: OrderWizardDashboardProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleStartNewOrder = () => {
        router.post(
            route('order-wizard-sessions.store'),
            {},
            {
                onError: () => {
                    toast.error('Failed to start new order. Please try again.');
                },
            },
        );
    };

    const handleResumeSession = (session: OrderWizardSession) => {
        router.visit(route('order-wizard.flow', { session: session.id }));
    };

    const handleDeleteSession = (sessionId: string) => {
        setIsDeleting(sessionId);

        console.log('🚨 sessionId: ', sessionId);

        router.delete(route('order-wizard-sessions.destroy', sessionId), {
            onSuccess: () => {
                toast.success('Draft order deleted successfully');
                setIsDeleting(null);
            },
            onError: (errors) => {
                console.error('Error deleting session:', errors);
                toast.error('Failed to delete draft order. Please try again.');
                setIsDeleting(null);
            },
            onFinish: () => {
                setIsDeleting(null);
            },
            only: ['sessions'],
        });
    };

    const getProgressPercentage = (step: string): number => {
        switch (step) {
            case 'vessel_port':
                return 25;
            case 'categories':
                return 50;
            case 'services':
                return 75;
            case 'review':
                return 100;
            default:
                return 0;
        }
    };

    const getStepLabel = (step: string): string => {
        switch (step) {
            case 'vessel_port':
                return 'Selecting Vessel & Port';
            case 'categories':
                return 'Selecting Categories';
            case 'services':
                return 'Selecting Services';
            case 'review':
                return 'Ready for Review';
            default:
                return 'Getting Started';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Wizard" />

            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-8 rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Order Wizard</h1>
                        <p className="text-muted-foreground">Create orders step-by-step with our guided wizard, or resume your draft orders.</p>
                    </div>
                    <Button onClick={handleStartNewOrder} size="lg">
                        <Plus className="mr-2 h-5 w-5" />
                        Start New Order
                    </Button>
                </div>

                {/* Draft Orders */}
                {sessions.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((session) => (
                            <Card key={session.id} className="transition-shadow hover:shadow-md">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{session.session_name}</CardTitle>
                                            <CardDescription className="mt-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(session.updated_at)}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteSession(session.id)}
                                            disabled={isDeleting === session.id}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Progress */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-medium">{getStepLabel(session.current_step)}</span>
                                            <span className="text-muted-foreground">{getProgressPercentage(session.current_step)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary transition-all duration-300"
                                                style={{ width: `${getProgressPercentage(session.current_step)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        {session.vessel && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Ship className="h-4 w-4" />
                                                <span>{session.vessel.name}</span>
                                            </div>
                                        )}
                                        {session.port && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{session.port.name}</span>
                                            </div>
                                        )}
                                        {session.expires_at && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Expires {formatDate(session.expires_at)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <Button onClick={() => handleResumeSession(session)} className="w-full" variant="outline">
                                        Resume Order
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <Card className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Plus className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <CardHeader>
                            <CardTitle>No Draft Orders</CardTitle>
                            <CardDescription>Get started by creating your first order with our step-by-step wizard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleStartNewOrder} size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Start Your First Order
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Links */}
                <div className="flex items-center gap-4 border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        Need help? Check out our{' '}
                        <Link href="#" className="text-primary hover:underline">
                            order guide
                        </Link>{' '}
                        or{' '}
                        <Link href={route('orders.index')} className="text-primary hover:underline">
                            view all orders
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
