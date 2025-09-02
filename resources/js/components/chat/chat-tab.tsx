import { useEffect, useRef, useState } from 'react';

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
    orderGroupId: string;
    currentUserId: string;
}

export function ChatTab({ orderGroupId, currentUserId }: ChatTabProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch(route('order-groups.messages.index', orderGroupId), {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });
                const data = await response.json();
                setMessages(data.messages);
            } catch {
                toast.error('Failed to load chat messages');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [orderGroupId]);

    // Listen for new messages via WebSocket
    useEcho(`private-order-group-chat.${orderGroupId}`, 'ChatMessageSent', ({ message }: { message: ChatMessage }) => {
        setMessages((prev) => [...prev, message]);
        
        // Mark messages as read when received
        if (message.user_id !== currentUserId) {
            setTimeout(() => {
                fetch(route('order-groups.messages.read', orderGroupId), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
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

    const handleSendMessage = async (message: string) => {
        setSending(true);
        
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

        try {
            const response = await fetch(route('order-groups.messages.store', orderGroupId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            
            // Replace optimistic message with real message from server
            setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === optimisticMessage.id ? data.message : msg
                )
            );
        } catch {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="h-[500px] flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                    {loading ? (
                        <div className="text-center text-muted-foreground py-8">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</div>
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
                <ChatInput onSendMessage={handleSendMessage} disabled={sending} />
            </CardContent>
        </Card>
    );
}