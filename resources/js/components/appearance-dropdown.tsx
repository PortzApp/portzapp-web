import { HTMLAttributes } from 'react';

import { Monitor, Moon, Sun } from 'lucide-react';

import { useAppearance } from '@/hooks/use-appearance';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="mr-2" />;
            case 'light':
                return <Sun className="mr-2" />;
            default:
                return <Monitor className="mr-2" />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <DropdownMenuItem asChild>
                        <button type="button" className="block w-full">
                            {getCurrentIcon()}
                            Switch theme
                        </button>
                    </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateAppearance('light')}>
                        <span className="flex items-center gap-2">
                            <Sun className="h-5 w-5" />
                            Light
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateAppearance('dark')}>
                        <span className="flex items-center gap-2">
                            <Moon className="h-5 w-5" />
                            Dark
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateAppearance('system')}>
                        <span className="flex items-center gap-2">
                            <Monitor className="h-5 w-5" />
                            System
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
