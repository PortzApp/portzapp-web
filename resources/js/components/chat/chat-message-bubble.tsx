import { useState } from 'react';

import { Check, CheckCheck, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
    id: string;
    message: string;
    user_id: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    parent_message_id?: string;
    parent_message?: {
        id: string;
        message: string;
        user: {
            first_name: string;
            last_name: string;
        };
    };
    delivered_at?: string;
    reads?: Array<{
        user_id: string;
        read_at: string;
    }>;
    created_at: string;
}

interface ChatMessageBubbleProps {
    message: ChatMessage;
    currentUserId: string;
    onReply?: (message: ChatMessage) => void;
}

export function ChatMessageBubble({ message, currentUserId, onReply }: ChatMessageBubbleProps) {
    const [showTime, setShowTime] = useState(false);
    const isOwnMessage = message.user_id === currentUserId;
    const senderName = `${message.user.first_name} ${message.user.last_name}`.trim();
    
    // Check if message has been read by the other party
    const isRead = message.reads && message.reads.some(read => read.user_id !== currentUserId);
    const readAt = message.reads?.find(read => read.user_id !== currentUserId)?.read_at;
    
    return (
        <div className={cn(
            "flex w-full",
            isOwnMessage ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[70%] space-y-1",
                isOwnMessage && "items-end"
            )}>
                {/* Reply context */}
                {message.parent_message && (
                    <div className={cn(
                        "rounded-md border-l-4 bg-muted/50 p-2 text-xs",
                        isOwnMessage ? "border-l-primary" : "border-l-muted-foreground"
                    )}>
                        <div className="font-medium">
                            {message.parent_message.user.first_name} {message.parent_message.user.last_name}
                        </div>
                        <div className="text-muted-foreground truncate">
                            {message.parent_message.message}
                        </div>
                    </div>
                )}

                {/* Message bubble */}
                <div className={cn(
                    "relative rounded-lg px-3 py-2 text-sm group cursor-pointer",
                    isOwnMessage 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                )} onClick={() => setShowTime(!showTime)}>
                    
                    {/* Sender name for received messages */}
                    {!isOwnMessage && (
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                            {senderName}
                        </div>
                    )}
                    
                    {/* Message content */}
                    <div className="whitespace-pre-wrap break-words">
                        {message.message}
                    </div>
                    
                    {/* Reply button */}
                    {onReply && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                                "absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0",
                                isOwnMessage ? "right-0" : "left-0"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onReply(message);
                            }}
                        >
                            <Reply className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Message metadata */}
                <div className={cn(
                    "flex items-center gap-1 text-xs text-muted-foreground",
                    isOwnMessage ? "justify-end" : "justify-start",
                    showTime ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                )}>
                    {/* Timestamp */}
                    <span>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    
                    {/* Read receipts for own messages */}
                    {isOwnMessage && (
                        <div className="flex items-center">
                            {isRead ? (
                                <div className="flex items-center gap-0.5">
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                    {readAt && (
                                        <span className="text-blue-500">
                                            {new Date(readAt).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </span>
                                    )}
                                </div>
                            ) : message.delivered_at ? (
                                <div className="flex items-center gap-0.5">
                                    <Check className="h-3 w-3" />
                                    <span>
                                        {new Date(message.delivered_at).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}