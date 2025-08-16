import { useId, useState } from 'react';

import { CheckIcon, ChevronDownIcon, LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SearchableSelectItem {
    value: string;
    label: string;
    subtitle?: string;
    icon?: LucideIcon;
}

interface SearchableSelectProps {
    items: SearchableSelectItem[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    label?: string;
    groupLabel?: string;
}

export function SearchableSelect({
    items,
    value,
    onValueChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No items found.',
    label,
    groupLabel = 'Options',
}: SearchableSelectProps) {
    const id = useId();
    const [open, setOpen] = useState<boolean>(false);

    const selectedItem = items.find((item) => item.value === value);

    return (
        <div className="flex flex-col gap-2">
            {label && <Label htmlFor={id}>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="min-h-12 w-full justify-between border-input bg-background px-3 py-6 font-normal outline-offset-0 outline-none hover:bg-background focus-visible:outline-[3px]"
                    >
                        {selectedItem ? (
                            <span className="flex min-w-0 items-center gap-2">
                                {selectedItem.icon && <selectedItem.icon size={16} className="text-muted-foreground" />}
                                <div className="flex flex-col items-start text-left">
                                    <span className="truncate">{selectedItem.label}</span>
                                    {selectedItem.subtitle && <span className="truncate text-xs text-muted-foreground">{selectedItem.subtitle}</span>}
                                </div>
                            </span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        <ChevronDownIcon size={16} className="shrink-0 text-muted-foreground/80" aria-hidden="true" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup heading={groupLabel}>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={`${item.label} ${item.subtitle || ''}`}
                                        onSelect={() => {
                                            onValueChange?.(item.value);
                                            setOpen(false);
                                        }}
                                    >
                                        {item.icon && <item.icon size={16} className="text-muted-foreground" />}
                                        <div className="flex flex-col">
                                            <span>{item.label}</span>
                                            {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                                        </div>
                                        {value === item.value && <CheckIcon size={16} className="ml-auto" />}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
