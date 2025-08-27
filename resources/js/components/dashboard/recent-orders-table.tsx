import { router } from '@inertiajs/react';

import { OrderStatus } from '@/types/enums';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { OrderStatusBadge } from '@/components/badges/order-status-badge';

interface Order {
    id: string;
    vessel_name?: string;
    port_name?: string;
    client_name?: string;
    status: string;
    total_price: number;
    created_at: string;
}

interface RecentOrdersTableProps {
    orders: Order[];
    title?: string;
    description?: string;
    showClientName?: boolean;
    showViewAllLink?: boolean;
    viewAllRoute?: string;
    onRowClick?: (order: Order) => void;
}

export function RecentOrdersTable({
    orders,
    title = 'Recent Orders',
    description = 'Latest order activity',
    showClientName = false,
    showViewAllLink = false,
    viewAllRoute,
    onRowClick,
}: RecentOrdersTableProps) {
    return (
        <Card className="bg-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {showViewAllLink && viewAllRoute && (
                        <Button variant="outline" size="sm" onClick={() => router.visit(viewAllRoute)}>
                            View All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Vessel</TableHead>
                            <TableHead>Port</TableHead>
                            {showClientName && <TableHead>Client</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showClientName ? 7 : 6} className="text-center text-muted-foreground">
                                    No recent orders
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                                    onClick={() => onRowClick && onRowClick(order)}
                                >
                                    <TableCell className="font-mono text-sm">
                                        <span className={onRowClick ? 'hover:underline' : ''}>{order.id.slice(0, 8)}...</span>
                                    </TableCell>
                                    <TableCell>{order.vessel_name || '-'}</TableCell>
                                    <TableCell>{order.port_name || '-'}</TableCell>
                                    {showClientName && <TableCell>{order.client_name || '-'}</TableCell>}
                                    <TableCell>
                                        <OrderStatusBadge status={order.status as OrderStatus} />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">${order.total_price.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{order.created_at}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
