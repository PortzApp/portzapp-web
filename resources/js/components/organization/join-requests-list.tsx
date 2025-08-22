import { useEffect, useState } from 'react';

import { Building, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import type { JoinRequest } from '@/types';
import { OrganizationBusinessType } from '@/types/enums';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { JoinRequestStatusWithDate } from './join-request-status';
import { WithdrawRequestButton } from './join-request-withdrawal-dialog';

interface JoinRequestsListProps {
    initialRequests?: JoinRequest[];
    isLoading?: boolean;
    onRefresh?: () => void;
}

interface JoinRequestWithOrganization extends JoinRequest {
    organization: {
        id: string;
        name: string;
        business_type: OrganizationBusinessType;
        member_count?: number;
    };
}

const businessTypeLabels = {
    [OrganizationBusinessType.SHIPPING_AGENCY]: 'Shipping Agency',
    [OrganizationBusinessType.VESSEL_OWNER]: 'Vessel Owner',
    [OrganizationBusinessType.PORTZAPP_TEAM]: 'PortzApp Team',
};

export function JoinRequestsList({ initialRequests = [], isLoading: externalIsLoading = false, onRefresh }: JoinRequestsListProps) {
    const [requests, setRequests] = useState<JoinRequestWithOrganization[]>(initialRequests as JoinRequestWithOrganization[]);
    const [isLoading, setIsLoading] = useState(externalIsLoading);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn'>('all');

    // Filter requests based on search and status
    const filteredRequests = requests.filter((request) => {
        const matchesSearch = searchQuery === '' || request.organization.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Load requests from API
    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/join-requests', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to load requests: ${response.status}`);
            }

            const data = await response.json();
            setRequests(data.data || []);
        } catch (error) {
            console.error('Failed to load join requests:', error);
            toast.error('Loading Error', {
                description: 'Failed to load your join requests. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle request withdrawal success
    const handleRequestWithdrawn = (withdrawnRequestId: string) => {
        setRequests((prev) => prev.filter((request) => request.id !== withdrawnRequestId));
        toast.success('Request Withdrawn', {
            description: 'Your join request has been withdrawn successfully.',
        });
    };

    // Handle refresh
    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else {
            loadRequests();
        }
    };

    // Load requests on mount if no initial data
    useEffect(() => {
        if (initialRequests.length === 0 && !externalIsLoading) {
            loadRequests();
        }
    }, [externalIsLoading, initialRequests.length]);

    // Update requests when external data changes
    useEffect(() => {
        if (initialRequests.length > 0) {
            setRequests(initialRequests as JoinRequestWithOrganization[]);
        }
    }, [initialRequests]);

    // Update loading state when external loading changes
    useEffect(() => {
        setIsLoading(externalIsLoading);
    }, [externalIsLoading]);

    if (isLoading && requests.length === 0) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="mb-2 h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-semibold">My Join Requests</h2>
                    <p className="text-muted-foreground">Track your organization join requests and their status</p>
                </div>

                <Button onClick={handleRefresh} disabled={isLoading} variant="outline" size="sm">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={(value: string) => setStatusFilter(value as 'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn')}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results Summary */}
            {requests.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    {filteredRequests.length === requests.length
                        ? `${requests.length} total request${requests.length !== 1 ? 's' : ''}`
                        : `${filteredRequests.length} of ${requests.length} request${requests.length !== 1 ? 's' : ''}`}
                </div>
            )}

            {/* Requests List */}
            {filteredRequests.length === 0 && requests.length > 0 ? (
                <Card className="p-8 text-center">
                    <div className="space-y-2">
                        <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No matching requests</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms or filters.</p>
                    </div>
                </Card>
            ) : filteredRequests.length === 0 && !isLoading ? (
                <Card className="p-8 text-center">
                    <div className="space-y-2">
                        <Building className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No join requests yet</h3>
                        <p className="text-muted-foreground">
                            You haven't sent any join requests yet. Use the search function to find organizations to join.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <Card key={request.id} className="transition-all hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Building className="h-5 w-5 text-muted-foreground" />
                                            {request.organization.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {businessTypeLabels[request.organization.business_type]}
                                            </Badge>
                                            {request.organization.member_count && (
                                                <span className="text-xs text-muted-foreground">{request.organization.member_count} members</span>
                                            )}
                                        </CardDescription>
                                    </div>

                                    <div className="ml-4 flex items-center gap-2">
                                        <WithdrawRequestButton joinRequest={request} onSuccess={() => handleRequestWithdrawn(request.id)} />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <JoinRequestStatusWithDate status={request.status} createdAt={request.created_at} updatedAt={request.updated_at} />

                                {request.message && (
                                    <div className="rounded-lg bg-muted p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Your message:</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{request.message}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
