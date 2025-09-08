import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatConversation {
    id: string;
    order_group_id: string;
    last_message?: {
        id: string;
        message: string;
        user: {
            first_name: string;
            last_name: string;
        };
        created_at: string;
    };
    last_message_at?: string;
    participants?: Array<{
        user_id: string;
        organization: {
            id: string;
            name: string;
        };
        unread_count: number;
    }>;
    order_group: {
        id: string;
        group_number: string;
        fulfilling_organization: {
            id: string;
            name: string;
        };
        order: {
            vessel: {
                name: string;
            };
        };
    };
}

interface ConversationSelectorProps {
    conversations: ChatConversation[];
    selectedConversationId?: string;
    currentUserId: string;
    onSelectConversation: (conversationId: string) => void;
}

export function ConversationSelector({ conversations, selectedConversationId, currentUserId, onSelectConversation }: ConversationSelectorProps) {
    if (conversations.length === 0) {
        return (
            <Card className="h-full">
                <CardContent className="flex h-full flex-col items-center justify-center p-6">
                    <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-center text-muted-foreground">No active conversations yet</p>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Conversations will appear here when you receive messages from shipping agencies
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardContent className="p-0">
                <div className="border-b p-4">
                    <h3 className="font-semibold">Agency Conversations</h3>
                    <p className="text-sm text-muted-foreground">Chat with shipping agencies about your orders</p>
                </div>

                <ScrollArea className="h-[calc(100%-80px)]">
                    <div className="space-y-1 p-2">
                        {conversations.map((conversation) => {
                            const unreadCount = conversation.participants?.find((p) => p.user_id === currentUserId)?.unread_count || 0;

                            const isSelected = selectedConversationId === conversation.id;

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(conversation.id)}
                                    className={cn('w-full rounded-lg p-3 text-left transition-colors hover:bg-muted/50', isSelected && 'bg-muted')}
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            <div className="truncate font-medium">{conversation.order_group.fulfilling_organization.name}</div>
                                            {unreadCount > 0 && (
                                                <Badge variant="destructive" className="flex h-5 w-5 items-center justify-center p-0 text-xs">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-1 text-xs text-muted-foreground">Order Group: {conversation.order_group.group_number}</div>

                                    <div className="mb-2 text-xs text-muted-foreground">Vessel: {conversation.order_group.order.vessel.name}</div>

                                    {conversation.last_message ? (
                                        <div className="space-y-1">
                                            <div className="truncate text-sm text-muted-foreground">
                                                <span className="font-medium">{conversation.last_message.user.first_name}:</span>{' '}
                                                {conversation.last_message.message}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">No messages yet</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
