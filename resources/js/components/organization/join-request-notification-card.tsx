import React, { useEffect, useState } from 'react';

import { router } from '@inertiajs/react';
import { ArrowRight, Bell, CheckCircle, Clock, Users, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface JoinRequestNotificationStats {
    pending: number;
    approved: number;
    rejected: number;
    withdrawn: number;
    total: number;
}

interface JoinRequestNotificationCardProps {
    className?: string;
}

const JoinRequestNotificationCard: React.FC<JoinRequestNotificationCardProps> = ({ className }) => {
    const [stats, setStats] = useState<JoinRequestNotificationStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Load join request statistics
    const loadStats = async () => {
        try {
            const response = await fetch('/api/admin/join-requests/statistics', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error loading join request stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    // Don't show if no pending requests
    if (!loading && (!stats || stats.pending === 0)) {
        return null;
    }

    const handleViewRequests = () => {
        // Navigate to admin join requests page - update this route as needed
        router.visit('/admin/join-requests');
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex h-20 items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`${className} border-orange-200 bg-orange-50`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-orange-100 p-2">
                            <Bell className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium text-orange-900">Join Requests Pending</CardTitle>
                            <CardDescription className="text-xs text-orange-700">New members waiting for approval</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                        {stats?.pending || 0}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4">
                {stats && stats.pending > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-600" />
                                <span className="text-orange-800">
                                    {stats.pending} request{stats.pending !== 1 ? 's' : ''} need{stats.pending === 1 ? 's' : ''} review
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-yellow-600" />
                                <span className="text-yellow-700">{stats.pending} Pending</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">{stats.approved} Approved</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span className="text-red-700">{stats.rejected} Rejected</span>
                            </div>
                        </div>

                        <Button onClick={handleViewRequests} size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                            Review Requests
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default JoinRequestNotificationCard;
