import { useEffect, useRef, useState } from 'react';

import { useForm } from '@inertiajs/react';
// TEMPORARILY DISABLED - WebSocket functionality disabled in production
// import { useEcho } from '@laravel/echo-react';
import { MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

import { ChatMessageBubble } from './chat-message-bubble';

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

interface ChatConversation {
    id: string;
    order_group_id: string;
    messages?: ChatMessage[];
    order_group: {
        id: string;
        group_number: string;
        fulfilling_organization: {
            id: string;
            name: string;
        };
        order?: {
            vessel: {
                name: string;
            };
        };
    };
}

interface ChatConversationImprovedProps {
    conversation: ChatConversation;
    currentUserId: string;
    className?: string;
}

export function ChatConversationImproved({ conversation, currentUserId, className }: ChatConversationImprovedProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages || []);
    const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
        parent_message_id: null as string | null,
    });

    // Update messages when conversation changes
    useEffect(() => {
        setMessages(conversation.messages || []);
    }, [conversation.messages]);

    // TEMPORARILY DISABLED - WebSocket functionality disabled in production
    // // Listen for new messages via WebSocket
    // useEcho(`private-chat-conversation.${conversation.id}`, 'ChatMessageSent', ({ message }: { message: ChatMessage }) => {
    //     setMessages((prev) => [...prev, message]);
    //
    //     // Mark messages as read when received from other users
    //     if (message.user_id !== currentUserId) {
    //         setTimeout(() => {
    //             post(route('chat.conversations.messages.read', conversation.id), {
    //                 preserveState: true,
    //                 preserveScroll: true,
    //             });
    //         }, 1000);
    //     }
    // });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!data.message.trim()) return;

        // Create optimistic message
        const optimisticMessage: ChatMessage = {
            id: Date.now().toString(),
            message: data.message,
            user_id: currentUserId,
            user: {
                id: currentUserId,
                first_name: 'You',
                last_name: '',
                email: '',
            },
            parent_message_id: data.parent_message_id || undefined,
            parent_message: replyToMessage
                ? {
                      id: replyToMessage.id,
                      message: replyToMessage.message,
                      user: replyToMessage.user,
                  }
                : undefined,
            delivered_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
        };

        // Add optimistic message
        setMessages((prev) => [...prev, optimisticMessage]);

        // Submit message
        post(route('chat.conversations.messages.store', conversation.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setReplyToMessage(null);
                setData('parent_message_id', null);
            },
            onError: () => {
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
                toast.error('Failed to send message');
            },
        });
    };

    const handleReply = (message: ChatMessage) => {
        setReplyToMessage(message);
        setData('parent_message_id', message.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className={cn('flex h-full flex-col', className)}>
            <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{conversation.order_group.fulfilling_organization.name}</div>
                        <div className="text-sm font-normal text-muted-foreground">
                            Order: {conversation.order_group.group_number}
                            {conversation.order_group.order?.vessel?.name && ` • Vessel: ${conversation.order_group.order.vessel.name}`}
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col p-0">
                {/* Messages */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                <p className="mb-2 text-lg font-medium">Start the conversation</p>
                                <p className="text-sm">Send your first message to begin chatting</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {messages.map((message) => (
                                <ChatMessageBubble key={message.id} message={message} currentUserId={currentUserId} onReply={handleReply} />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Reply Context */}
                {replyToMessage && (
                    <div className="border-t bg-muted/50 px-4 py-2">
                        <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-muted-foreground">
                                    Replying to {replyToMessage.user.first_name} {replyToMessage.user.last_name}
                                </div>
                                <div className="truncate text-sm">{replyToMessage.message}</div>
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                    setReplyToMessage(null);
                                    setData('parent_message_id', null);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Textarea
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="max-h-[120px] min-h-[40px] resize-none"
                            disabled={processing}
                        />
                        <Button onClick={handleSendMessage} disabled={processing || !data.message.trim()} size="sm">
                            Send
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
