import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye, User, Mail, Calendar, CheckSquare, Users } from 'lucide-react';
import { JoinRequest } from '@/types';
import JoinRequestActionModal from './join-request-action-modal';

interface AdminJoinRequestsTableProps {
    initialData?: {
        data: JoinRequest[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

interface JoinRequestStats {
    pending: number;
    approved: number;
    rejected: number;
    withdrawn: number;
    total: number;
}

const AdminJoinRequestsTable: React.FC<AdminJoinRequestsTableProps> = ({ initialData }) => {
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>(initialData?.data || []);
    const [meta, setMeta] = useState(initialData?.meta || { current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [stats, setStats] = useState<JoinRequestStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showActionModal, setShowActionModal] = useState<{ request: JoinRequest; action: 'approve' | 'reject' } | null>(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState<{ action: 'approve' | 'reject'; count: number } | null>(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Load join requests data
    const loadJoinRequests = async (status?: string, page?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status && status !== 'all') params.append('status', status);
            if (page) params.append('page', page.toString());

            const response = await fetch(`/api/admin/join-requests?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setJoinRequests(data.data);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error('Error loading join requests:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStatistics = async () => {
        try {
            const response = await fetch('/api/admin/join-requests/statistics', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    // Handle status filter change
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        loadJoinRequests(status, 1);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        loadJoinRequests(statusFilter === 'all' ? undefined : statusFilter, page);
    };

    // Handle view request details
    const handleViewRequest = (request: JoinRequest) => {
        setSelectedRequest(request);
    };

    // Handle approve/reject actions
    const handleApprove = (request: JoinRequest) => {
        setShowActionModal({ request, action: 'approve' });
    };

    const handleReject = (request: JoinRequest) => {
        setShowActionModal({ request, action: 'reject' });
    };

    // Handle selection changes
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const pendingIds = joinRequests.filter(req => req.status === 'pending').map(req => req.id);
            setSelectedItems(new Set(pendingIds));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (requestId: string, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(requestId);
        } else {
            newSelected.delete(requestId);
        }
        setSelectedItems(newSelected);
    };

    // Bulk operations
    const handleBulkAction = (action: 'approve' | 'reject') => {
        const count = selectedItems.size;
        if (count === 0) return;
        setShowBulkConfirm({ action, count });
    };

    const executeBulkAction = async () => {
        if (!showBulkConfirm) return;
        
        setBulkProcessing(true);
        const { action } = showBulkConfirm;
        const requestIds = Array.from(selectedItems);

        try {
            // Process each request individually since we don't have a bulk API endpoint
            const promises = requestIds.map(async (requestId) => {
                const endpoint = action === 'approve' 
                    ? `/api/admin/join-requests/${requestId}/approve`
                    : `/api/admin/join-requests/${requestId}/reject`;

                const body = action === 'approve' 
                    ? { role: 'VIEWER', admin_notes: 'Bulk approved' }
                    : { admin_notes: 'Bulk rejected' };

                return fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify(body)
                });
            });

            await Promise.all(promises);
            
            // Reload data and clear selection
            await loadJoinRequests(statusFilter === 'all' ? undefined : statusFilter);
            await loadStatistics();
            setSelectedItems(new Set());
            setShowBulkConfirm(null);
            
        } catch (error) {
            console.error('Bulk operation failed:', error);
        } finally {
            setBulkProcessing(false);
        }
    };

    // Handle action modal success
    const handleActionSuccess = () => {
        loadJoinRequests(statusFilter === 'all' ? undefined : statusFilter);
        loadStatistics();
        setShowActionModal(null);
    };

    // Get status badge color
    const getStatusBadge = (status: string) => {
        const variants = {
            pending: { variant: 'secondary' as const, icon: <Clock className="w-3 h-3" />, color: 'text-yellow-600' },
            approved: { variant: 'success' as const, icon: <CheckCircle className="w-3 h-3" />, color: 'text-green-600' },
            rejected: { variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" />, color: 'text-red-600' },
            withdrawn: { variant: 'outline' as const, icon: <XCircle className="w-3 h-3" />, color: 'text-gray-600' }
        };

        const config = variants[status as keyof typeof variants] || variants.pending;
        
        return (
            <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
                {config.icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
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
            minute: '2-digit'
        });
    };

    // Load data on component mount
    useEffect(() => {
        if (!initialData) {
            loadJoinRequests();
        }
        loadStatistics();
    }, []);

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                </div>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Withdrawn</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats.withdrawn}</p>
                                </div>
                                <XCircle className="h-4 w-4 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Join Requests</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Requests</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {/* Bulk Actions Bar */}
                    {selectedItems.size > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    {selectedItems.size} request{selectedItems.size !== 1 ? 's' : ''} selected
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={bulkProcessing}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Bulk Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleBulkAction('reject')}
                                    disabled={bulkProcessing}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Bulk Reject
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedItems(new Set())}
                                    disabled={bulkProcessing}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : joinRequests.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No join requests found.</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedItems.size > 0 && joinRequests.filter(req => req.status === 'pending').every(req => selectedItems.has(req.id))}
                                                onCheckedChange={handleSelectAll}
                                                disabled={joinRequests.filter(req => req.status === 'pending').length === 0}
                                            />
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {joinRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedItems.has(request.id)}
                                                    onCheckedChange={(checked) => handleSelectItem(request.id, checked as boolean)}
                                                    disabled={request.status !== 'pending'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {request.user ? 
                                                            `${request.user.first_name} ${request.user.last_name}` : 
                                                            'Unknown User'
                                                        }
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    {request.user?.email || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <p className="text-sm truncate" title={request.message || 'No message'}>
                                                        {request.message || 'No message provided'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(request.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{formatDate(request.created_at)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewRequest(request)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {request.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleApprove(request)}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleReject(request)}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((meta.current_page - 1) * meta.per_page) + 1} to {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(meta.current_page - 1)}
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
                                            onClick={() => handlePageChange(meta.current_page + 1)}
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

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Join Request Details</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedRequest(null)}
                                >
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">User</label>
                                <p className="text-sm text-muted-foreground">
                                    {selectedRequest.user ? 
                                        `${selectedRequest.user.first_name} ${selectedRequest.user.last_name} (${selectedRequest.user.email})` : 
                                        'Unknown User'
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Message</label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedRequest.message || 'No message provided'}
                                </p>
                            </div>
                            {selectedRequest.admin_notes && (
                                <div>
                                    <label className="text-sm font-medium">Admin Notes</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedRequest.admin_notes}
                                    </p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium">Requested</label>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(selectedRequest.created_at)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Last Updated</label>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(selectedRequest.updated_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && (
                <JoinRequestActionModal
                    joinRequest={showActionModal.request}
                    action={showActionModal.action}
                    onClose={() => setShowActionModal(null)}
                    onSuccess={handleActionSuccess}
                />
            )}

            {/* Bulk Confirmation Dialog */}
            {showBulkConfirm && (
                <Dialog open={true} onOpenChange={() => setShowBulkConfirm(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {showBulkConfirm.action === 'approve' ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                Bulk {showBulkConfirm.action === 'approve' ? 'Approve' : 'Reject'} Requests
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to {showBulkConfirm.action} {showBulkConfirm.count} join request{showBulkConfirm.count !== 1 ? 's' : ''}?
                                {showBulkConfirm.action === 'approve' && (
                                    <span className="block mt-2 text-sm">
                                        All approved users will be granted "Viewer" role by default.
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowBulkConfirm(null)}
                                disabled={bulkProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={executeBulkAction}
                                disabled={bulkProcessing}
                                className={showBulkConfirm.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                {bulkProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `${showBulkConfirm.action === 'approve' ? 'Approve' : 'Reject'} All`
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminJoinRequestsTable;