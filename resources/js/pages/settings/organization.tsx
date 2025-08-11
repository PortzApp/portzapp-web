import { Head } from '@inertiajs/react';

import { UserWithPivot } from '@/types/core';
import { UserRoles } from '@/types/enums';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

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

export default function OrganizationSettingsPage({ users }: { users: UserWithPivot[] }) {
    return (
        <AppLayout>
            <Head title="Organization settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Organization settings" description="Manage your organization's members" />

                    <div className="bg-white">
                        <div className="overflow-x-auto rounded-md border">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
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
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {user.first_name.charAt(0)}
                                                                    {user.last_name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
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
                                <p className="text-sm text-gray-500">No members found in this organization.</p>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
