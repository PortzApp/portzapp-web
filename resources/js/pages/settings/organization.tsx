import { useState } from 'react';

import { Head, router } from '@inertiajs/react';
import { Plus, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { UserWithPivot } from '@/types/core';
import { Invitation } from '@/types/models';
import { UserRoles } from '@/types/enums';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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

interface OrganizationSettingsPageProps {
    users: UserWithPivot[];
    pendingInvitations: Invitation[];
}

export default function OrganizationSettingsPage({ users, pendingInvitations }: OrganizationSettingsPageProps) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState<InvitationFormData>({
        email: '',
        role: UserRoles.VIEWER,
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Organization settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall title="Organization settings" description="Manage your organization's members" />
                        
                        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Invite Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Invite Team Member</DialogTitle>
                                    <DialogDescription>
                                        Send an invitation to join your organization. They'll receive an email with instructions to create their account.
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
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsInviteDialogOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleInviteSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Mail className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="h-4 w-4 mr-2" />
                                                Send Invitation
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="bg-white dark:bg-gray-900">
                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-900">
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
                                                <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200">
                                                    {getRoleLabel(user.pivot.role)}
                                                </span>
                                            </td>
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

                    {/* Pending Invitations Section */}
                    {pendingInvitations.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <HeadingSmall title="Pending Invitations" description="Invitations awaiting acceptance" />
                            
                            <div className="bg-white dark:bg-gray-900">
                                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase">Sent</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-900">
                                            {pendingInvitations.map((invitation) => (
                                                <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                                            <div className="text-sm text-gray-900 dark:text-gray-100">{invitation.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-semibold text-blue-800 dark:text-blue-200">
                                                            {getRoleLabel(invitation.role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Pending
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
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
