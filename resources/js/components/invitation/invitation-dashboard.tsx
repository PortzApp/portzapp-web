import React, { useEffect, useState } from 'react';

import { Invitation, InvitationStatistics } from '@/types';
import { AlertTriangle, CheckCircle, Clock, Plus, Users, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import InvitationList from './invitation-list';
import InviteUserModal from './invite-user-modal';

interface InvitationDashboardProps {
    initialInvitations?: {
        data: Invitation[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    initialStatistics?: InvitationStatistics;
}

const InvitationDashboard: React.FC<InvitationDashboardProps> = ({ initialInvitations, initialStatistics }) => {
    const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations?.data || []);
    const [meta, setMeta] = useState(initialInvitations?.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [statistics, setStatistics] = useState<InvitationStatistics | null>(initialStatistics || null);
    const [loading, setLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Load invitations data
    const loadInvitations = async (status?: string, page?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status && status !== 'all') params.append('status', status);
            if (page) params.append('page', page.toString());

            const response = await fetch(`/api/invitations?${params}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInvitations(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error('Error loading invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStatistics = async () => {
        try {
            const response = await fetch('/api/invitations/statistics', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStatistics(data.data);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    // Handle status filter change
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        loadInvitations(status, 1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        loadInvitations(statusFilter === 'all' ? undefined : statusFilter, page);
    };

    // Handle successful invitation
    const handleInvitationSent = () => {
        setShowInviteModal(false);
        loadInvitations(statusFilter === 'all' ? undefined : statusFilter, 1);
        loadStatistics();
    };

    // Handle invitation action (resend, cancel)
    const handleInvitationAction = async (invitationId: string, action: 'resend' | 'cancel') => {
        try {
            const response = await fetch(`/api/invitations/${invitationId}/${action}`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                loadInvitations(statusFilter === 'all' ? undefined : statusFilter, meta.current_page);
                loadStatistics();
            }
        } catch (error) {
            console.error(`Error ${action} invitation:`, error);
        }
    };

    // Load data on component mount
    useEffect(() => {
        if (!initialInvitations) {
            loadInvitations();
        }
        if (!initialStatistics) {
            loadStatistics();
        }
    }, [initialInvitations, initialStatistics]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Invitations</h1>
                    <p className="text-muted-foreground">Manage and track organization invitations</p>
                </div>
                <Button onClick={() => setShowInviteModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Users
                </Button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{statistics.total}</p>
                                </div>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                                </div>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                                    <p className="text-2xl font-bold text-green-600">{statistics.accepted}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Declined</p>
                                    <p className="text-2xl font-bold text-red-600">{statistics.declined}</p>
                                </div>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Expired</p>
                                    <p className="text-2xl font-bold text-gray-600">{statistics.expired}</p>
                                </div>
                                <AlertTriangle className="h-4 w-4 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                                    <p className="text-2xl font-bold text-gray-600">{statistics.cancelled}</p>
                                </div>
                                <XCircle className="h-4 w-4 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Invitation List */}
            <InvitationList
                invitations={invitations}
                meta={meta}
                loading={loading}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                onPageChange={handlePageChange}
                onInvitationAction={handleInvitationAction}
            />

            {/* Invite User Modal */}
            {showInviteModal && <InviteUserModal onClose={() => setShowInviteModal(false)} onSuccess={handleInvitationSent} />}
        </div>
    );
};

export default InvitationDashboard;
