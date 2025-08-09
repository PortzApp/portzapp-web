import { type User } from '@/types';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function getRoleLabel(role: string): string {
    switch (role) {
        case 'admin':
            return 'Admin';
        case 'member':
            return 'Member';
        default:
            return role;
    }
}

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    return (
        <div className="flex flex-1 items-center gap-2">
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {/*<AvatarImage src={user.avatar} alt={user.first_name} />*/}
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {user.first_name.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.first_name}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
            {user.current_organization?.role && (
                <Badge variant="outline" className="truncate rounded-full text-xs capitalize">
                    {getRoleLabel(user.current_organization?.role)}
                </Badge>
            )}
        </div>
    );
}
