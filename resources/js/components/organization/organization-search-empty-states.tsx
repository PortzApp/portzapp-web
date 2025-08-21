import { AlertCircle, Building, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">{icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="outline">
                    {action.label}
                </Button>
            )}
        </div>
    );
}

interface OrganizationSearchEmptyStatesProps {
    type: 'no-results' | 'network-error' | 'initial-state';
    searchQuery?: string;
    onRetry?: () => void;
    onClearSearch?: () => void;
}

export function OrganizationSearchEmptyStates({ type, searchQuery, onRetry, onClearSearch }: OrganizationSearchEmptyStatesProps) {
    switch (type) {
        case 'no-results':
            return (
                <EmptyState
                    icon={<Search className="h-8 w-8 text-muted-foreground" />}
                    title="No organizations found"
                    description={
                        searchQuery
                            ? `We couldn't find any organizations matching "${searchQuery}". Try adjusting your search terms or filters.`
                            : 'No organizations match your current filters. Try adjusting your search criteria.'
                    }
                    action={
                        searchQuery && onClearSearch
                            ? {
                                  label: 'Clear search',
                                  onClick: onClearSearch,
                              }
                            : undefined
                    }
                />
            );

        case 'network-error':
            return (
                <EmptyState
                    icon={<AlertCircle className="h-8 w-8 text-destructive" />}
                    title="Connection error"
                    description="We're having trouble loading organizations. Please check your connection and try again."
                    action={
                        onRetry
                            ? {
                                  label: 'Retry',
                                  onClick: onRetry,
                              }
                            : undefined
                    }
                />
            );

        case 'initial-state':
        default:
            return (
                <EmptyState
                    icon={<Building className="h-8 w-8 text-muted-foreground" />}
                    title="Discover organizations"
                    description="Search for organizations you'd like to join. Use the search box above to find organizations by name or filter by business type."
                />
            );
    }
}
