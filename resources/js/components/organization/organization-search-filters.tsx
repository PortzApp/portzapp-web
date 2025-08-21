import { Filter, X } from 'lucide-react';

import type { OrganizationSearchFilters } from '@/types';
import { OrganizationBusinessType } from '@/types/enums';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrganizationSearchFiltersProps {
    filters: OrganizationSearchFilters;
    onFiltersChange: (filters: OrganizationSearchFilters) => void;
    onClearFilters: () => void;
}

const businessTypeOptions = [
    { value: OrganizationBusinessType.SHIPPING_AGENCY, label: 'Shipping Agency' },
    { value: OrganizationBusinessType.VESSEL_OWNER, label: 'Vessel Owner' },
    { value: OrganizationBusinessType.PORTZAPP_TEAM, label: 'PortzApp Team' },
];

export function OrganizationSearchFilters({ filters, onFiltersChange, onClearFilters }: OrganizationSearchFiltersProps) {
    const hasActiveFilters = Object.values(filters).some((value) => value && value.length > 0);

    const handleBusinessTypeChange = (value: string) => {
        if (value === 'all') {
            onFiltersChange({ ...filters, business_type: undefined });
        } else {
            onFiltersChange({ ...filters, business_type: value as OrganizationBusinessType });
        }
    };

    const removeBusinessTypeFilter = () => {
        onFiltersChange({ ...filters, business_type: undefined });
    };

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span>Filters:</span>
                </div>

                <Select value={filters.business_type || 'all'} onValueChange={handleBusinessTypeChange}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Business Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Business Types</SelectItem>
                        {businessTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={onClearFilters} className="flex items-center gap-2">
                        <X className="h-3 w-3" />
                        Clear filters
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>

                    {filters.business_type && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                            {businessTypeOptions.find((opt) => opt.value === filters.business_type)?.label}
                            <Button variant="ghost" size="sm" className="h-4 h-auto w-4 p-0 hover:bg-transparent" onClick={removeBusinessTypeFilter}>
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
