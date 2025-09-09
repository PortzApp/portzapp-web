import { useEffect, useRef, useState } from 'react';

import { router, useForm } from '@inertiajs/react';
// TEMPORARILY DISABLED - WebSocket functionality disabled in production
// import { useEcho } from '@laravel/echo-react';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import type { ChatMessage as ChatMessageType, OrderGroup } from '@/types/models';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';

interface ChatConversationProps {
    orderGroup: OrderGroup;
    currentUserId: string;
}

export function ChatConversation({ orderGroup, currentUserId }: ChatConversationProps) {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const conversation = orderGroup.chat_conversation;

    const { processing, reset } = useForm({
        message: '',
    });

    // Initialize messages from props when conversation changes
    useEffect(() => {
        if (conversation?.messages) {
            setMessages(conversation.messages);
        } else {
            setMessages([]);
        }
    }, [conversation]);

    // TEMPORARILY DISABLED - WebSocket functionality disabled in production
    // // Listen for new messages via WebSocket
    // useEcho(`private-order-group-chat.${orderGroup.id}`, 'ChatMessageSent', ({ message }: { message: ChatMessageType }) => {
    //     setMessages((prev) => [...prev, message]);
    //
    //     // Mark messages as read when received
    //     if (message.user_id !== currentUserId && conversation?.id) {
    //         setTimeout(() => {
    //             router.patch(
    //                 route('chat.messages.read', conversation.id),
    //                 {},
    //                 {
    //                     preserveState: true,
    //                     preserveScroll: true,
    //                 },
    //             );
    //         }, 1000);
    //     }
    // });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (message: string) => {
        if (!conversation?.id) {
            toast.error('No conversation available');
            return;
        }

        // Optimistically add the message to the UI
        const optimisticMessage: ChatMessageType = {
            id: Date.now().toString(), // Temporary ID
            conversation_id: conversation.id,
            user_id: currentUserId,
            parent_message_id: null,
            message,
            message_type: 'text',
            delivered_at: new Date().toISOString(),
            edited_at: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
                id: currentUserId,
                first_name: 'You',
                last_name: '',
                email: '',
            },
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        // Send message using Inertia router
        router.post(
            route('chat.messages.send', conversation.id),
            { message },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Remove optimistic message - real message will come via WebSocket
                    setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
                    reset('message');
                },
                onError: () => {
                    // Remove optimistic message on error
                    setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
                    toast.error('Failed to send message');
                },
            },
        );
    };

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat with {orderGroup.fulfilling_organization?.name || 'Agency'}
                    <span className="text-sm font-normal text-muted-foreground">#{orderGroup.group_number}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                    {!conversation ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No conversation available. You may not have permission to view this chat.
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No messages yet. Start the conversation!</div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg.message}
                                    senderName={`${msg.user?.first_name || ''} ${msg.user?.last_name || ''}`.trim()}
                                    timestamp={msg.delivered_at}
                                    isOwnMessage={msg.user_id === currentUserId}
                                    isRead={msg.reads?.some((read) => read.user_id === currentUserId) || false}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <ChatInput onSendMessage={handleSendMessage} disabled={processing || !conversation?.id} />
            </CardContent>
        </Card>
    );
}
