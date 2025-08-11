import { FormEventHandler, useState } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2, Edit3, X } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { OrganizationBusinessType, UserRoles } from '@/types/enums';
import { OrganizationWithMembers, User, UserWithRole } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import InputError from '@/components/input-error';

const businessTypeOptions = [
    { value: 'shipping_agency', label: 'Shipping Agency' },
    { value: 'vessel_owner', label: 'Vessel Owner' },
    { value: 'portzapp_team', label: 'PortzApp Team' },
] as const;

const userRoleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'ceo', label: 'CEO' },
    { value: 'manager', label: 'Manager' },
    { value: 'operations', label: 'Operations' },
    { value: 'finance', label: 'Finance' },
    { value: 'viewer', label: 'Viewer' },
] as const;

interface Props {
    organization: OrganizationWithMembers;
    availableUsers: User[];
    businessTypes: { value: string; label: string }[];
    userRoles: { value: string; label: string }[];
}

export default function EditOrganizationPage({ organization, availableUsers, businessTypes, userRoles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Organizations',
            href: '/organizations',
        },
        {
            title: organization.name,
            href: `/organizations/${organization.id}`,
        },
        {
            title: 'Edit',
            href: `/organizations/${organization.id}/edit`,
        },
    ];

    type OrganizationForm = Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'users_count'>;

    const { data, setData, put, processing, errors } = useForm<OrganizationForm>({
        name: organization.name,
        registration_code: organization.registration_code,
        business_type: organization.business_type,
    });

    // Member management state
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<UserWithRole | null>(null);
    
    // Add member form
    const { data: addMemberData, setData: setAddMemberData, post: postAddMember, processing: addMemberProcessing, errors: addMemberErrors, reset: resetAddMember } = useForm({
        user_id: '',
        role: 'viewer' as UserRoles,
    });
    
    // Edit role form
    const { data: editRoleData, setData: setEditRoleData, put: putEditRole, processing: editRoleProcessing, errors: editRoleErrors } = useForm({
        role: 'viewer' as UserRoles,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('organizations.update', organization.id), {
            onSuccess: () => {
                router.visit(route('organizations.index'), {
                    only: ['organizations'],
                });
            },
        });
    };
    
    const handleAddMember = () => {
        postAddMember(route('organizations.members.add', organization.id), {
            onSuccess: () => {
                setIsAddMemberOpen(false);
                resetAddMember();
                router.reload({ only: ['organization', 'availableUsers'] });
            },
        });
    };
    
    const handleRemoveMember = (user: UserWithRole) => {
        if (confirm(`Are you sure you want to remove ${user.first_name} ${user.last_name} from this organization?`)) {
            router.delete(route('organizations.members.remove', [organization.id, user.id]), {
                onSuccess: () => {
                    router.reload({ only: ['organization', 'availableUsers'] });
                },
            });
        }
    };
    
    const handleEditRole = (user: UserWithRole) => {
        setSelectedMember(user);
        setEditRoleData('role', user.pivot.role);
        setIsEditRoleOpen(true);
    };
    
    const handleUpdateRole = () => {
        if (!selectedMember) return;
        
        putEditRole(route('organizations.members.role.update', [organization.id, selectedMember.id]), {
            onSuccess: () => {
                setIsEditRoleOpen(false);
                setSelectedMember(null);
                router.reload({ only: ['organization'] });
            },
        });
    };
    
    const getRoleLabel = (role: UserRoles) => {
        return userRoleOptions.find(r => r.value === role)?.label || role;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${organization.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Organization</h1>
                    <p className="text-base text-muted-foreground">
                        Update the organization information below. You can modify the organization name, registration code, and business type.
                    </p>
                </div>

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter organization name"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="registration_code">Registration Code</Label>
                        <Input
                            id="registration_code"
                            type="text"
                            value={data.registration_code}
                            onChange={(e) => setData('registration_code', e.target.value)}
                            placeholder="Enter registration code"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.registration_code} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="business_type">Business Type</Label>
                        <Select value={data.business_type} onValueChange={(value: OrganizationBusinessType) => setData('business_type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                                {businessTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.business_type} />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing} className="w-fit">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Organization
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('organizations.index'))}
                        disabled={processing}
                        className="w-fit"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
            
            <Separator className="my-8" />
            
            {/* Member Management Section */}
            <div className="p-8 pt-0">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Organization Members</CardTitle>
                                <CardDescription>
                                    Manage users who have access to this organization. You can add new members, remove existing ones, and update their roles.
                                </CardDescription>
                            </div>
                            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Member</DialogTitle>
                                        <DialogDescription>
                                            Select a user and assign them a role in this organization.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="user_id">User</Label>
                                            <Select value={addMemberData.user_id} onValueChange={(value) => setAddMemberData('user_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableUsers.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.first_name} {user.last_name} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={addMemberErrors.user_id} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select value={addMemberData.role} onValueChange={(value: UserRoles) => setAddMemberData('role', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userRoleOptions.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            {role.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={addMemberErrors.role} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddMember} disabled={addMemberProcessing}>
                                            {addMemberProcessing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Add Member
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {organization.users && organization.users.length > 0 ? (
                            <div className="space-y-4">
                                {organization.users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {getRoleLabel(user.pivot.role)}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditRole(user)}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRemoveMember(user)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No members found in this organization.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Edit Role Dialog */}
            <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Member Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedMember?.first_name} {selectedMember?.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_role">Role</Label>
                            <Select value={editRoleData.role} onValueChange={(value: UserRoles) => setEditRoleData('role', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userRoleOptions.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={editRoleErrors.role} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditRoleOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole} disabled={editRoleProcessing}>
                            {editRoleProcessing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
