import { cn } from '@/lib/utils';

interface ChatMessageProps {
    message: string;
    senderName: string;
    timestamp: string;
    isOwnMessage: boolean;
    isRead?: boolean;
}

export function ChatMessage({ message, senderName, timestamp, isOwnMessage, isRead }: ChatMessageProps) {
    return (
        <div className={cn('flex w-full', isOwnMessage ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-xs rounded-lg px-4 py-2', isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {!isOwnMessage && <div className="mb-1 text-xs font-medium text-muted-foreground">{senderName}</div>}
                <div className="text-sm">{message}</div>
                <div
                    className={cn(
                        'mt-1 flex items-center gap-1 text-xs',
                        isOwnMessage ? 'justify-end text-primary-foreground/70' : 'text-muted-foreground',
                    )}
                >
                    <time>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                    {isOwnMessage && isRead && <span>✓</span>}
                </div>
            </div>
        </div>
    );
}
