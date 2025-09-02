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
            <div className={cn('max-w-xs px-4 py-2 rounded-lg', isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {!isOwnMessage && <div className="text-xs font-medium text-muted-foreground mb-1">{senderName}</div>}
                <div className="text-sm">{message}</div>
                <div className={cn('text-xs mt-1 flex items-center gap-1', isOwnMessage ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground')}>
                    <time>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                    {isOwnMessage && isRead && <span>✓</span>}
                </div>
            </div>
        </div>
    );
}