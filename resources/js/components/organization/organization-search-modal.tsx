import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchableOrganizationList } from './searchable-organization-list';
import { OrganizationSearchFilters } from './organization-search-filters';
import { toast } from 'sonner';
import type { 
    SearchableOrganization, 
    OrganizationSearchFilters as SearchFilters,
    OrganizationSearchResponse 
} from '@/types';

interface OrganizationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserOrganizations?: string[];
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function OrganizationSearchModal({
    isOpen,
    onClose,
    currentUserOrganizations = [],
}: OrganizationSearchModalProps) {
    
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({});
    const [organizations, setOrganizations] = useState<SearchableOrganization[]>([]);
    const [meta, setMeta] = useState<OrganizationSearchResponse['meta'] | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Search function
    const performSearch = useCallback(async (
        query: string = debouncedSearchQuery,
        searchFilters: SearchFilters = filters,
        page: number = 1,
        append: boolean = false
    ) => {
        // Don't search if no query and no filters
        if (!query.trim() && !searchFilters.business_type) {
            if (!append) {
                setOrganizations([]);
                setMeta(undefined);
                setHasSearched(false);
            }
            return;
        }

        setIsLoading(true);
        setIsError(false);
        setHasSearched(true);

        try {
            const searchParams = new URLSearchParams();
            if (query.trim()) searchParams.append('query', query.trim());
            if (searchFilters.business_type) searchParams.append('business_type', searchFilters.business_type);
            if (page > 1) searchParams.append('page', page.toString());

            const response = await fetch(`/api/organizations/search?${searchParams.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data: OrganizationSearchResponse = await response.json();

            if (append) {
                setOrganizations(prev => [...prev, ...data.data]);
            } else {
                setOrganizations(data.data);
            }
            setMeta(data.meta);
        } catch (error) {
            console.error('Organization search error:', error);
            setIsError(true);
            toast.error('Search Error', {
                description: 'Failed to search organizations. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchQuery, filters]);

    // Handle search when debounced query or filters change
    useEffect(() => {
        performSearch();
    }, [debouncedSearchQuery, filters]);

    // Handle join request
    const handleJoinRequest = async (organizationId: string) => {
        try {
            await new Promise<void>((resolve, reject) => {
                router.post('/api/join-requests', {
                    organization_id: organizationId,
                }, {
                    onSuccess: () => {
                        toast.success('Join Request Sent', {
                            description: 'Your request to join the organization has been sent.',
                        });
                        resolve();
                    },
                    onError: (errors) => {
                        const errorMessage = Object.values(errors).flat().join(', ') || 'Failed to send join request';
                        toast.error('Request Failed', {
                            description: errorMessage,
                        });
                        reject(new Error(errorMessage));
                    },
                });
            });
        } catch (error) {
            throw error; // Re-throw to handle in OrganizationCard
        }
    };

    // Handle load more (infinite scroll)
    const handleLoadMore = useCallback(() => {
        if (meta && meta.current_page < meta.last_page && !isLoading) {
            performSearch(debouncedSearchQuery, filters, meta.current_page + 1, true);
        }
    }, [meta, isLoading, performSearch, debouncedSearchQuery, filters]);

    // Handle retry
    const handleRetry = () => {
        performSearch();
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setFilters({});
        setOrganizations([]);
        setMeta(undefined);
        setHasSearched(false);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setFilters({});
    };

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setFilters({});
            setOrganizations([]);
            setMeta(undefined);
            setIsLoading(false);
            setIsError(false);
            setHasSearched(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Find Organizations to Join</DialogTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 min-h-0">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search organizations by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Search Filters */}
                    <OrganizationSearchFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClearFilters={handleClearFilters}
                    />

                    {/* Results */}
                    <ScrollArea className="flex-1">
                        <SearchableOrganizationList
                            organizations={organizations}
                            meta={meta}
                            isLoading={isLoading}
                            isError={isError}
                            searchQuery={hasSearched ? debouncedSearchQuery : undefined}
                            currentUserOrganizations={currentUserOrganizations}
                            onJoinRequest={handleJoinRequest}
                            onLoadMore={handleLoadMore}
                            onRetry={handleRetry}
                            onClearSearch={handleClearSearch}
                        />
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}