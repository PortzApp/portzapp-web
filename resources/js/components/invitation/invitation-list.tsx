import React from 'react';

import { Invitation } from '@/types';
import { AlertTriangle, Calendar, CheckCircle, Clock, Mail, RotateCcw, User, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InvitationListProps {
    invitations: Invitation[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    loading: boolean;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    onPageChange: (page: number) => void;
    onInvitationAction: (invitationId: string, action: 'resend' | 'cancel') => void;
}

const InvitationList: React.FC<InvitationListProps> = ({
    invitations,
    meta,
    loading,
    statusFilter,
    onStatusChange,
    onPageChange,
    onInvitationAction,
}) => {
    // Get status badge color and icon
    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { variant: 'secondary' as const, icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600' },
            accepted: { variant: 'success' as const, icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600' },
            declined: { variant: 'destructive' as const, icon: <XCircle className="h-3 w-3" />, color: 'text-red-600' },
            expired: { variant: 'outline' as const, icon: <AlertTriangle className="h-3 w-3" />, color: 'text-gray-600' },
            cancelled: { variant: 'outline' as const, icon: <XCircle className="h-3 w-3" />, color: 'text-gray-600' },
        };

        const config = variants[status as keyof typeof variants] || variants.pending;

        return (
            <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
                {config.icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    // Get role badge
    const getRoleBadge = (role: string) => {
        const roleColors = {
            ADMIN: 'bg-red-100 text-red-800',
            CEO: 'bg-purple-100 text-purple-800',
            MANAGER: 'bg-blue-100 text-blue-800',
            OPERATIONS: 'bg-green-100 text-green-800',
            FINANCE: 'bg-yellow-100 text-yellow-800',
            VIEWER: 'bg-gray-100 text-gray-800',
        };

        const colorClass = roleColors[role as keyof typeof roleColors] || roleColors.VIEWER;

        return (
            <Badge variant="outline" className={colorClass}>
                {role}
            </Badge>
        );
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Check if invitation is expired
    const isExpired = (invitation: Invitation) => {
        return new Date(invitation.expires_at) < new Date();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Invitations</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Invitations</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="py-8 text-center">
                        <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No invitations found</h3>
                        <p className="mt-1 text-muted-foreground">
                            {statusFilter === 'all' ? 'Start by inviting users to your organization.' : `No ${statusFilter} invitations found.`}
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invitee</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Invited By</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{invitation.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(invitation.status)}
                                            {invitation.status === 'pending' && isExpired(invitation) && (
                                                <Badge variant="outline" className="ml-2 text-red-600">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                                    Expired
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {invitation.invited_by_user ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {invitation.invited_by_user.first_name} {invitation.invited_by_user.last_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Unknown</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(invitation.created_at)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className={`text-sm ${isExpired(invitation) ? 'font-medium text-red-600' : ''}`}>
                                                    {formatDate(invitation.expires_at)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {invitation.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => onInvitationAction(invitation.id, 'resend')}
                                                            title="Resend invitation"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => onInvitationAction(invitation.id, 'cancel')}
                                                            title="Cancel invitation"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {invitation.status === 'accepted' && (
                                                    <Badge variant="success" className="text-green-600">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Joined
                                                    </Badge>
                                                )}
                                                {(invitation.status === 'declined' ||
                                                    invitation.status === 'expired' ||
                                                    invitation.status === 'cancelled') && (
                                                    <span className="text-sm text-muted-foreground">No actions</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {meta.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(meta.current_page - 1) * meta.per_page + 1} to {Math.min(meta.current_page * meta.per_page, meta.total)}{' '}
                                    of {meta.total} invitations
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {meta.current_page} of {meta.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default InvitationList;
