import { useEffect, useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';

import type { OrganizationSearchResponse, SearchableOrganization } from '@/types';

import { OrganizationCard } from './organization-card';
import { OrganizationSearchEmptyStates } from './organization-search-empty-states';

interface SearchableOrganizationListProps {
    organizations: SearchableOrganization[];
    meta?: OrganizationSearchResponse['meta'];
    isLoading: boolean;
    isError: boolean;
    searchQuery?: string;
    currentUserOrganizations?: string[];
    onJoinRequest: (organizationId: string) => Promise<void>;
    onLoadMore?: () => void;
    onRetry?: () => void;
    onClearSearch?: () => void;
}

export function SearchableOrganizationList({
    organizations,
    meta,
    isLoading,
    isError,
    searchQuery,
    currentUserOrganizations = [],
    onJoinRequest,
    onLoadMore,
    onRetry,
    onClearSearch,
}: SearchableOrganizationListProps) {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const hasNextPage = meta ? meta.current_page < meta.last_page : false;
    const isEmpty = organizations.length === 0;

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!onLoadMore || !hasNextPage || isLoading || isLoadingMore) {
            return;
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !isLoading && !isLoadingMore && hasNextPage) {
                    setIsLoadingMore(true);
                    onLoadMore?.();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px',
            },
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observerRef.current.observe(currentRef);
        }

        return () => {
            if (observerRef.current && currentRef) {
                observerRef.current.unobserve(currentRef);
            }
        };
    }, [hasNextPage, isLoading, isLoadingMore, onLoadMore]);

    // Reset loading more state when new data arrives
    useEffect(() => {
        setIsLoadingMore(false);
    }, [organizations]);

    // Show error state
    if (isError && isEmpty) {
        return <OrganizationSearchEmptyStates type="network-error" onRetry={onRetry} />;
    }

    // Show initial state when no search has been performed
    if (isEmpty && !isLoading && !searchQuery) {
        return <OrganizationSearchEmptyStates type="initial-state" />;
    }

    // Show no results state
    if (isEmpty && !isLoading) {
        return <OrganizationSearchEmptyStates type="no-results" searchQuery={searchQuery} onClearSearch={onClearSearch} />;
    }

    return (
        <div className="space-y-4">
            {/* Results summary */}
            {meta && organizations.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    Showing {meta.from} to {meta.to} of {meta.total} organizations
                    {searchQuery && <span> for "{searchQuery}"</span>}
                </div>
            )}

            {/* Organization grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((organization) => (
                    <OrganizationCard
                        key={organization.id}
                        organization={organization}
                        onJoinRequest={onJoinRequest}
                        currentUserOrganizations={currentUserOrganizations}
                        isLoading={isLoading}
                    />
                ))}
            </div>

            {/* Loading states */}
            {isLoading && isEmpty && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-48 w-full rounded-lg bg-muted" />
                        </div>
                    ))}
                </div>
            )}

            {/* Infinite scroll trigger and load more indicator */}
            {hasNextPage && (
                <div ref={loadMoreRef} className="flex justify-center py-6">
                    {(isLoadingMore || isLoading) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading more organizations...
                        </div>
                    )}
                </div>
            )}

            {/* End of results indicator */}
            {!hasNextPage && organizations.length > 0 && meta && meta.total > 6 && (
                <div className="py-6 text-center text-sm text-muted-foreground">You've reached the end of the results</div>
            )}
        </div>
    );
}
