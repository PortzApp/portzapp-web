import { useId } from 'react';

import { LucideIcon } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CategorySelectionItem {
    value: string;
    label: string;
    icon: LucideIcon;
    subtitle?: string;
    checked?: boolean;
}

interface CategorySelectionGridProps {
    items: CategorySelectionItem[];
    onItemChange?: (value: string, checked: boolean) => void;
}

export function CategorySelectionGrid({ items, onItemChange }: CategorySelectionGridProps) {
    const id = useId();

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((item) => (
                <div
                    key={`${id}-${item.value}`}
                    className="relative flex cursor-pointer flex-col gap-4 rounded-md border border-input p-4 shadow-xs transition-colors outline-none hover:border-muted-foreground/50 has-data-[state=checked]:border-primary/50"
                    onClick={() => onItemChange?.(item.value, !item.checked)}
                >
                    <div className="flex justify-between gap-2">
                        <Checkbox
                            id={`${id}-${item.value}`}
                            value={item.value}
                            className="order-1 after:absolute after:inset-0"
                            checked={item.checked}
                            onCheckedChange={(checked) => onItemChange?.(item.value, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <item.icon className="opacity-60" size={16} aria-hidden="true" />
                    </div>
                    <div>
                        <Label htmlFor={`${id}-${item.value}`} className="cursor-pointer font-medium">
                            {item.label}
                        </Label>
                        {item.subtitle && <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}
