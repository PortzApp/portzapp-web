import { useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { OrganizationBusinessType, UserRoles } from '@/types/enums';
import { Organization } from '@/types/models';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrganizationUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    pivot: {
        organization_id: string;
        user_id: string;
        role: UserRoles;
        created_at: string;
        updated_at: string;
    };
}

interface OrganizationWithMembers extends Organization {
    users: OrganizationUser[];
}

const businessTypeLabels = {
    [OrganizationBusinessType.VESSEL_OWNER]: 'Vessel Owner',
    [OrganizationBusinessType.SHIPPING_AGENCY]: 'Shipping Agency',
    [OrganizationBusinessType.PORTZAPP_TEAM]: 'Portzapp Team',
};

const roleLabels = {
    [UserRoles.ADMIN]: 'Administrator',
    [UserRoles.CEO]: 'CEO',
    [UserRoles.MANAGER]: 'Manager',
    [UserRoles.OPERATIONS]: 'Operations',
    [UserRoles.FINANCE]: 'Finance',
    [UserRoles.VIEWER]: 'Viewer',
};

export default function ShowOrganizationPage({ organization }: { organization: OrganizationWithMembers }) {
    const { auth } = usePage<SharedData>().props;

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Organizations',
            href: '/organizations',
        },
        {
            title: organization.name,
            href: `/organizations/${organization.id}`,
        },
    ];

    function handleDeleteOrganization() {
        setOpenDeleteDialog(false);

        router.delete(route('organizations.destroy', organization.id), {
            onSuccess: () => {
                toast(`Organization "${organization.name}" deleted successfully!`);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={organization.name} />

            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{organization.name}</h1>
                        <p className="text-base text-muted-foreground">Organization details and information</p>
                    </div>
                    <div className="flex gap-2">
                        {auth.permissions.organization.edit && (
                            <Link href={route('organizations.edit', organization.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        )}

                        {auth.permissions.organization.delete && (
                            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Organization</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete "{organization.name}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button variant="destructive" onClick={handleDeleteOrganization}>
                                            Delete Organization
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
                            <CardDescription>Core organization details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                <span className="text-sm font-medium">{organization.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Registration Code:</span>
                                <span className="font-mono text-sm font-medium">{organization.registration_code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Business Type:</span>
                                <Badge variant="secondary">{businessTypeLabels[organization.business_type]}</Badge>
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
                                <span className="text-sm font-medium text-muted-foreground">Organization ID:</span>
                                <span className="text-sm font-medium tabular-nums">#{organization.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(organization.created_at).toLocaleDateString('en-US', {
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
                                    {new Date(organization.updated_at).toLocaleDateString('en-US', {
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

                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Organization Members
                                </CardTitle>
                                <CardDescription>
                                    Users who are part of this organization
                                    {organization.users && organization.users.length > 0 && (
                                        <span className="ml-2">
                                            ({organization.users.length} member{organization.users.length !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {organization.users && organization.users.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {organization.users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        {user.first_name} {user.last_name}
                                                    </TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>{user.phone_number}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{roleLabels[user.pivot.role]}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(user.pivot.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                        <p className="mt-2 text-sm text-muted-foreground">No members found</p>
                                        <p className="text-xs text-muted-foreground">This organization doesn't have any members yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
