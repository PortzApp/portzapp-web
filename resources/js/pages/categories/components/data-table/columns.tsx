import { ColumnDef } from '@tanstack/react-table';

import { ServiceCategory } from '@/types/models';

import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';

import { CategoriesPageColumnActions } from './column-actions';

interface ExpandableCategoryRow extends ServiceCategory {
    isExpanded?: boolean;
    isSubCategory?: boolean;
    parentId?: string;
}

export const columns: ColumnDef<ExpandableCategoryRow>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
            const category = row.original;
            return <div className="font-medium">{category.name}</div>;
        },
    },
    {
        accessorKey: 'sub_categories_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sub-Categories" />,
        cell: ({ row }) => {
            const category = row.original;
            const count = category.sub_categories_count || 0;
            return <span className="tabular-nums">{count}</span>;
        },
    },
    {
        accessorKey: 'services_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Services" />,
        cell: ({ row }) => {
            const category = row.original;
            const count = category.services_count || 0;
            return <span className="tabular-nums">{count}</span>;
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ row }) => {
            const category = row.original;

            return (
                <p className="text-sm tabular-nums">
                    {(() => {
                        const now = new Date();
                        const created = new Date(category.created_at);
                        const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

                        if (diff < 60) return `${diff} seconds ago`;
                        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

                        // Fallback to date if more than a week ago
                        return created.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                    })()}
                </p>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const category = row.original;
            return <CategoriesPageColumnActions category={category} />;
        },
        enableSorting: false,
        enableHiding: false,
    },
];