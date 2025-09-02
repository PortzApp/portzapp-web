import { useState } from 'react';

import { MessageSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrderGroup {
    id: string;
    group_number: string;
    fulfilling_organization?: {
        id: string;
        name: string;
    };
}

interface ChatSelectorProps {
    orderGroups: OrderGroup[];
    selectedOrderGroupId: string | null;
    onSelectOrderGroup: (orderGroupId: string) => void;
}

export function ChatSelector({ 
    orderGroups, 
    selectedOrderGroupId, 
    onSelectOrderGroup 
}: ChatSelectorProps) {
    const [unreadCounts] = useState<Record<string, number>>({});

    if (!orderGroups || orderGroups.length === 0) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Chats
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground py-8">
                        No agencies to chat with yet.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chats
                    <Badge variant="secondary">{orderGroups.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                    <div className="space-y-1 p-4">
                        {orderGroups.map((orderGroup) => {
                            const isSelected = selectedOrderGroupId === orderGroup.id;
                            const unreadCount = unreadCounts[orderGroup.id] || 0;
                            
                            return (
                                <Button
                                    key={orderGroup.id}
                                    variant={isSelected ? "secondary" : "ghost"}
                                    className={`w-full justify-start h-auto p-3 ${
                                        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => onSelectOrderGroup(orderGroup.id)}
                                >
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {orderGroup.fulfilling_organization?.name || 'Agency'}
                                                </span>
                                                {unreadCount > 0 && (
                                                    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                Group #{orderGroup.group_number}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <div className="h-2 w-2 bg-primary rounded-full" />
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}