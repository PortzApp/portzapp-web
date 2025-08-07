import { VesselStatusBadge } from '@/components/badges';
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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Vessel } from '@/types/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VesselShowPage({ vessel }: { vessel: Vessel }) {
    const { auth } = usePage<SharedData>().props;

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Vessels',
            href: '/vessels',
        },
        {
            title: vessel.name,
            href: `/vessels/${vessel.id}`,
        },
    ];

    function handleDeleteVessel() {
        setOpenDeleteDialog(false);

        router.delete(route('vessels.destroy', vessel.id), {
            onSuccess: () => {
                toast(`Vessel "${vessel.name}" deleted successfully!`);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={vessel.name} />

            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{vessel.name}</h1>
                        <p className="text-base text-muted-foreground">Vessel details and information</p>
                    </div>
                    <div className="flex gap-2">
                        {auth.can.vessels.edit && (
                            <Link href={route('vessels.edit', vessel.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
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
                                        <DialogTitle>Delete Vessel</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete "{vessel.name}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button variant="destructive" onClick={handleDeleteVessel}>
                                            Delete Vessel
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
                            <CardDescription>Core vessel details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                <span className="text-sm font-medium">{vessel.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">IMO Number:</span>
                                <span className="text-sm font-medium tabular-nums">{vessel.imo_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Type:</span>
                                <Badge
                                    className={cn(
                                        vessel.vessel_type === 'cargo' && 'bg-neutral-100 text-neutral-800 uppercase',
                                        vessel.vessel_type === 'tanker' && 'bg-neutral-100 text-neutral-800 uppercase',
                                        vessel.vessel_type === 'container' && 'bg-neutral-100 text-neutral-800 uppercase',
                                    )}
                                >
                                    {vessel.vessel_type}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <VesselStatusBadge status={vessel.status} className="capitalize" />
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
                                <span className="text-sm font-medium text-muted-foreground">Vessel ID:</span>
                                <span className="text-sm font-medium tabular-nums">#{vessel.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(vessel.created_at).toLocaleDateString('en-US', {
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
                                    {new Date(vessel.updated_at).toLocaleDateString('en-US', {
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
