import { useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Info, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { Vessel } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { VesselStatusBadge, VesselTypeBadge } from '@/components/badges';

export default function ShowVesselPage({ vessel }: { vessel: Vessel }) {
    const { auth } = usePage<SharedData>().props;

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Vessels',
            href: route('vessels.index'),
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
                        {auth.permissions.vessel.edit && (
                            <Link href={route('vessels.edit', vessel.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        )}

                        {auth.permissions.vessel.delete && (
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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                <VesselTypeBadge type={vessel.vessel_type} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <VesselStatusBadge status={vessel.status} className="capitalize" />
                            </div>
                            {vessel.flag_state && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Flag State:</span>
                                    <span className="text-sm font-medium">{vessel.flag_state}</span>
                                </div>
                            )}
                            {vessel.call_sign && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Call Sign:</span>
                                    <span className="text-sm font-medium tabular-nums">{vessel.call_sign}</span>
                                </div>
                            )}
                            {vessel.mmsi && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">MMSI:</span>
                                    <span className="text-sm font-medium tabular-nums">{vessel.mmsi}</span>
                                </div>
                            )}
                            {vessel.build_year && (
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Build Year:</span>
                                    <span className="text-sm font-medium tabular-nums">{vessel.build_year}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Specifications</CardTitle>
                            <CardDescription>Vessel dimensions and capacity</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {vessel.grt && (
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">Gross Register Tonnage (GRT):</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Total internal volume of the vessel</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{new Intl.NumberFormat().format(vessel.grt)}</span>
                                </div>
                            )}
                            {vessel.nrt && (
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">Net Register Tonnage (NRT):</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Cargo carrying capacity volume</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{new Intl.NumberFormat().format(vessel.nrt)}</span>
                                </div>
                            )}
                            {vessel.dwt && (
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">Deadweight Tonnage (DWT):</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Maximum cargo weight capacity</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">
                                        {new Intl.NumberFormat().format(Math.round(vessel.dwt / 1000))} tons
                                    </span>
                                </div>
                            )}
                            {vessel.loa && (
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">Length Overall (LOA):</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Total length of the vessel</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{(vessel.loa / 1000).toFixed(1)} meters</span>
                                </div>
                            )}
                            {vessel.beam && (
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">Beam:</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Width of the vessel at its widest point</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{(vessel.beam / 1000).toFixed(1)} meters</span>
                                </div>
                            )}
                            {vessel.draft && (
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">Draft:</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Depth of the vessel below the waterline</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <span className="text-sm font-medium tabular-nums">{(vessel.draft / 1000).toFixed(1)} meters</span>
                                </div>
                            )}
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
                            {vessel.remarks && (
                                <div className="space-y-2 border-t border-border pt-2">
                                    <span className="text-sm font-medium text-muted-foreground">Remarks:</span>
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{vessel.remarks}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
