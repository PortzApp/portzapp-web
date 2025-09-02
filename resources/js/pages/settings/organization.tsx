import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Clock, Edit3, Info, Loader2, Mail, MoreVertical, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { UserWithPivot } from '@/types/core';
import { UserRoles } from '@/types/enums';
import { Invitation, Organization } from '@/types/models';
import { SharedData } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import HeadingSmall from '@/components/heading-small';

// Helper function to get human-readable role labels
function getRoleLabel(role: UserRoles): string {
    const roleLabels = {
        [UserRoles.ADMIN]: 'Admin',
        [UserRoles.CEO]: 'CEO',
        [UserRoles.MANAGER]: 'Manager',
        [UserRoles.OPERATIONS]: 'Operations',
        [UserRoles.FINANCE]: 'Finance',
        [UserRoles.VIEWER]: 'Viewer',
    };
    return roleLabels[role] || role;
}

interface InvitationFormData {
    email: string;
    role: UserRoles;
    message?: string;
}

type OrganizationForm = {
    name: string;
    registration_code: string;
    description: string;
};

interface OrganizationSettingsPageProps {
    users: UserWithPivot[];
    pendingInvitations: Invitation[];
    organization: Organization;
}

export default function OrganizationSettingsPage({ users, pendingInvitations, organization }: OrganizationSettingsPageProps) {
    const { auth } = usePage<SharedData>().props;
    const canUpdateOrganization = auth.permissions?.organization?.update_current ?? false;
    const canUpdateMemberRoles = auth.permissions?.organization?.updateMemberRole ?? false;
    
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isOrgEditDialogOpen, setIsOrgEditDialogOpen] = useState(false);
    const [roleUpdateInProgress, setRoleUpdateInProgress] = useState<string | null>(null);
    const [inviteForm, setInviteForm] = useState<InvitationFormData>({
        email: '',
        role: UserRoles.VIEWER,
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, patch, errors, processing } = useForm<Required<OrganizationForm>>({
        name: organization.name,
        registration_code: organization.registration_code,
        description: organization.description || '',
    });

    const handleInviteSubmit = () => {
        if (!inviteForm.email || !inviteForm.role) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        router.post(
            route('organization.invitations.send'),
            {
                email: inviteForm.email,
                role: inviteForm.role,
                message: inviteForm.message || null,
            },
            {
                onSuccess: () => {
                    toast.success('Invitation sent successfully!');
                    setIsInviteDialogOpen(false);
                    setInviteForm({ email: '', role: UserRoles.VIEWER, message: '' });
                },
                onError: (errors) => {
                    if (errors.email) {
                        toast.error(errors.email);
                    } else {
                        toast.error('Failed to send invitation. Please try again.');
                    }
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const handleOrgSubmit = () => {
        patch(route('organization.update'), {
            onSuccess: () => {
                toast.success('Organization updated successfully!');
                setIsOrgEditDialogOpen(false);
            },
            preserveScroll: true,
        });
    };

    const handleRoleChange = (userId: string, newRole: UserRoles) => {
        setRoleUpdateInProgress(userId);
        
        router.patch(
            route('organization.members.updateRole', userId),
            { role: newRole },
            {
                onSuccess: () => {
                    toast.success('Member role updated successfully!');
                },
                onError: (errors) => {
                    if (errors.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error('Failed to update member role. Please try again.');
                    }
                },
                onFinish: () => {
                    setRoleUpdateInProgress(null);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Organization settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Organization Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <HeadingSmall title="Organization Information" description="Update your organization details" />
                            
                            {canUpdateOrganization ? (
                                <Dialog open={isOrgEditDialogOpen} onOpenChange={setIsOrgEditDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Edit3 className="mr-2 h-4 w-4" />
                                            Edit Organization
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Edit Organization</DialogTitle>
                                            <DialogDescription>
                                                Update your organization's information and settings.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="org-name">Organization Name *</Label>
                                                <Input
                                                    id="org-name"
                                                    type="text"
                                                    placeholder="Your Organization Name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    disabled={processing}
                                                />
                                                <InputError className="mt-2" message={errors.name} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="org-reg-code">Registration Code *</Label>
                                                <Input
                                                    id="org-reg-code"
                                                    type="text"
                                                    placeholder="ABC123"
                                                    value={data.registration_code}
                                                    onChange={(e) => setData('registration_code', e.target.value)}
                                                    disabled={processing}
                                                />
                                                <InputError className="mt-2" message={errors.registration_code} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="org-description">Description</Label>
                                                <Textarea
                                                    id="org-description"
                                                    placeholder="Brief description of your organization..."
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    rows={3}
                                                    disabled={processing}
                                                />
                                                <InputError className="mt-2" message={errors.description} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsOrgEditDialogOpen(false)}
                                                disabled={processing}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleOrgSubmit}
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Edit3 className="mr-2 h-4 w-4" />
                                                        Update Organization
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-help">
                                                <Edit3 className="h-4 w-4" />
                                                <span>Edit Organization</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Contact an admin to make changes</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        {/* Organization Info Display */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Organization Name</Label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{organization.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Code</Label>
                                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{organization.registration_code}</p>
                                </div>
                                {organization.description && (
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{organization.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <HeadingSmall title="Team Members" description="Manage your organization's members" />
                            
                            {canUpdateMemberRoles ? (
                                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Invite Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Invite Team Member</DialogTitle>
                                            <DialogDescription>
                                                Send an invitation to join your organization. They'll receive an email with instructions to create their
                                                account.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="colleague@company.com"
                                                    value={inviteForm.email}
                                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="role">Role *</Label>
                                                <Select
                                                    value={inviteForm.role}
                                                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as UserRoles })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={UserRoles.VIEWER}>Viewer</SelectItem>
                                                        <SelectItem value={UserRoles.OPERATIONS}>Operations</SelectItem>
                                                        <SelectItem value={UserRoles.FINANCE}>Finance</SelectItem>
                                                        <SelectItem value={UserRoles.MANAGER}>Manager</SelectItem>
                                                        <SelectItem value={UserRoles.CEO}>CEO</SelectItem>
                                                        <SelectItem value={UserRoles.ADMIN}>Administrator</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="message">Personal message (optional)</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Add a personal note to the invitation..."
                                                    value={inviteForm.message}
                                                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isSubmitting}>
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={handleInviteSubmit} disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Mail className="mr-2 h-4 w-4 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        Send Invitation
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-help">
                                                <Info className="h-4 w-4" />
                                                <span>Member Management</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Contact an organization admin to invite members or change roles</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-900">
                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                            Role
                                        </th>
                                        {canUpdateMemberRoles && (
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-900">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full"
                                                                src={user.avatar}
                                                                alt={`${user.first_name} ${user.last_name}`}
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {user.first_name.charAt(0)}
                                                                    {user.last_name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {getRoleLabel(user.pivot.role)}
                                                </span>
                                            </td>
                                            {canUpdateMemberRoles && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                disabled={roleUpdateInProgress === user.id || user.id === auth.user.id}
                                                            >
                                                                {roleUpdateInProgress === user.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreVertical className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger disabled={user.id === auth.user.id}>
                                                                    Change Role
                                                                </DropdownMenuSubTrigger>
                                                                <DropdownMenuSubContent>
                                                                    {Object.values(UserRoles).map((role) => (
                                                                        <DropdownMenuItem
                                                                            key={role}
                                                                            onClick={() => handleRoleChange(user.id, role)}
                                                                            disabled={user.pivot.role === role}
                                                                            className={user.pivot.role === role ? 'opacity-50' : ''}
                                                                        >
                                                                            {getRoleLabel(role)}
                                                                            {user.pivot.role === role && (
                                                                                <span className="ml-auto text-xs text-gray-500">Current</span>
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuSub>
                                                            {user.id === auth.user.id && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem disabled className="text-xs text-gray-500">
                                                                        Cannot change own role
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No members found in this organization.</p>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Pending Invitations Section */}
                    {pendingInvitations.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <HeadingSmall title="Pending Invitations" description="Invitations awaiting acceptance" />

                            <div className="bg-white dark:bg-gray-900">
                                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                                    Sent
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-900">
                                            {pendingInvitations.map((invitation) => (
                                                <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Mail className="mr-3 h-4 w-4 text-gray-400" />
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">{invitation.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {getRoleLabel(invitation.role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            Pending
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        {new Date(invitation.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
