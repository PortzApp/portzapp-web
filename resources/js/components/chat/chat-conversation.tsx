import { useEffect, useRef, useState } from 'react';

import { useForm } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';

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
    read_at: string | null;
    created_at: string;
}

interface OrderGroup {
    id: string;
    group_number: string;
    fulfilling_organization?: {
        id: string;
        name: string;
    };
    chat_messages?: ChatMessage[];
}

interface ChatConversationProps {
    orderGroup: OrderGroup;
    currentUserId: string;
}

export function ChatConversation({ orderGroup, currentUserId }: ChatConversationProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(orderGroup.chat_messages || []);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const { setData, post, processing, reset } = useForm({
        message: '',
    });

    // Update messages when orderGroup changes
    useEffect(() => {
        setMessages(orderGroup.chat_messages || []);
    }, [orderGroup.chat_messages]);

    // Listen for new messages via WebSocket
    useEcho(`private-order-group-chat.${orderGroup.id}`, 'ChatMessageSent', ({ message }: { message: ChatMessage }) => {
        setMessages((prev) => [...prev, message]);

        // Mark messages as read when received
        if (message.user_id !== currentUserId) {
            setTimeout(() => {
                post(route('order-groups.messages.read', orderGroup.id), {
                    preserveState: true,
                    preserveScroll: true,
                });
            }, 1000);
        }
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (message: string) => {
        // Set form data
        setData('message', message);

        // Optimistically add the message to the UI
        const optimisticMessage: ChatMessage = {
            id: Date.now().toString(), // Temporary ID
            message,
            user_id: currentUserId,
            user: {
                id: currentUserId,
                first_name: 'You',
                last_name: '',
                email: '',
            },
            read_at: null,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        // Submit form using Inertia
        post(route('order-groups.messages.store', orderGroup.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('message');
                toast.success('Message sent');
            },
            onError: () => {
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
                toast.error('Failed to send message');
            },
        });
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
                    {messages.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">No messages yet. Start the conversation!</div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg.message}
                                    senderName={`${msg.user.first_name} ${msg.user.last_name}`.trim()}
                                    timestamp={msg.created_at}
                                    isOwnMessage={msg.user_id === currentUserId}
                                    isRead={!!msg.read_at}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <ChatInput onSendMessage={handleSendMessage} disabled={processing} />
            </CardContent>
        </Card>
    );
}
