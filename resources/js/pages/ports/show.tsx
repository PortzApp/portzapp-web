import { useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Dot, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { Port } from '@/types/models';

import { cn } from '@/lib/utils';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function PortShowPage({ port }: { port: Port }) {
    const { auth } = usePage<SharedData>().props;

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Ports',
            href: '/ports',
        },
        {
            title: port.name,
            href: `/ports/${port.id}`,
        },
    ];

    function handleDeletePort() {
        setOpenDeleteDialog(false);

        router.delete(route('ports.destroy', port.id), {
            onSuccess: () => {
                toast(`Port "${port.name}" deleted successfully!`);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={port.name} />

            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{port.name}</h1>
                        <p className="text-base text-muted-foreground">Port details and information</p>
                    </div>
                    <div className="flex gap-2">
                        {auth.can.ports.edit && (
                            <Link href={route('ports.edit', port.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        )}

                        {auth.can.vessels.delete && (
                            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Port</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete "{port.name}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button variant="destructive" onClick={handleDeletePort}>
                                            Delete Port
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core port details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                <span className="text-sm font-medium">{port.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Code:</span>
                                <span className="font-mono text-sm font-medium">{port.code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Country:</span>
                                <span className="text-sm font-medium">{port.country}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">City:</span>
                                <span className="text-sm font-medium">{port.city}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <Badge
                                    className={cn(
                                        port.status === 'active' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                                        port.status === 'inactive' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                                        port.status === 'maintenance' &&
                                            'bg-yellow-200 text-yellow-950 uppercase dark:bg-yellow-900 dark:text-yellow-50',
                                    )}
                                >
                                    <Dot />
                                    {port.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location Information</CardTitle>
                            <CardDescription>Geographic details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Latitude:</span>
                                <span className="text-sm font-medium tabular-nums">{port.latitude}°</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Longitude:</span>
                                <span className="text-sm font-medium tabular-nums">{port.longitude}°</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Timezone:</span>
                                <span className="text-sm font-medium">{port.timezone}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                            <CardDescription>Record metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Port ID:</span>
                                <span className="text-sm font-medium tabular-nums">#{port.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(port.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(port.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
