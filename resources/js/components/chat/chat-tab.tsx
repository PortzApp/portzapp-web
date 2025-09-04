import { useEffect, useRef, useState } from 'react';

import { router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
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

interface ChatTabProps {
    conversationId: string;
    initialMessages: ChatMessage[];
    currentUserId: string;
}

export function ChatTab({ conversationId, initialMessages, currentUserId }: ChatTabProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [processing, setProcessing] = useState(false);

    // Listen for new messages via WebSocket
    useEcho(`private-conversation-chat.${conversationId}`, 'ChatMessageSent', ({ message }: { message: ChatMessage }) => {
        setMessages((prev) => [...prev, message]);

        // Mark messages as read when received
        if (message.user_id !== currentUserId) {
            setTimeout(() => {
                router.patch(route('chat.messages.read', conversationId), {}, {
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
        setProcessing(true);
        
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

        // Send message using Inertia router
        router.post(route('chat.messages.send', conversationId), { message }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                // Remove optimistic message - real message will come via WebSocket
                setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
                toast.success('Message sent');
            },
            onError: () => {
                setProcessing(false);
                // Remove optimistic message on error
                setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
                toast.error('Failed to send message');
            },
        });
    };

    return (
        <Card className="flex h-[500px] flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Chat</CardTitle>
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
