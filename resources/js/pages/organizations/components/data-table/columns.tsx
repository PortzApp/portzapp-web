import { OrganizationsPageColumnActions } from '@/pages/organizations/components/data-table/column-actions';
import { ColumnDef } from '@tanstack/react-table';

import { Organization } from '@/types/models';
import { OrganizationBusinessType } from '@/types/enums';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';

export const columns: ColumnDef<Organization>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value: boolean) => row.toggleSelected(value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
        accessorKey: 'registration_code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Registration Code" />,
        cell: ({ row }) => {
            const organization = row.original;

            return <p className="font-mono">{organization.registration_code}</p>;
        },
    },
    {
        accessorKey: 'business_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Business Type" />,
        cell: ({ row }) => {
            const organization = row.original;

            const getBusinessTypeDisplay = (businessType: string) => {
                switch (businessType) {
                    case OrganizationBusinessType.VESSEL_OWNER:
                        return 'Vessel Owner';
                    case OrganizationBusinessType.SHIPPING_AGENCY:
                        return 'Shipping Agency';
                    case OrganizationBusinessType.PORTZAPP_TEAM:
                        return 'Portzapp Team';
                    default:
                        return businessType;
                }
            };

            const getBusinessTypeBadgeColor = (businessType: string) => {
                switch (businessType) {
                    case OrganizationBusinessType.VESSEL_OWNER:
                        return 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50';
                    case OrganizationBusinessType.SHIPPING_AGENCY:
                        return 'bg-green-200 text-green-950 uppercase dark:bg-green-900 dark:text-green-50';
                    case OrganizationBusinessType.PORTZAPP_TEAM:
                        return 'bg-purple-200 text-purple-950 uppercase dark:bg-purple-900 dark:text-purple-50';
                    default:
                        return 'bg-gray-200 text-gray-950 uppercase dark:bg-gray-900 dark:text-gray-50';
                }
            };

            return (
                <Badge className={cn(getBusinessTypeBadgeColor(organization.business_type))}>
                    {getBusinessTypeDisplay(organization.business_type)}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'users_count',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Member Count" />,
        cell: ({ row }) => {
            const organization = row.original;

            return <p className="tabular-nums">{organization.users_count ?? 0}</p>;
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const organization = row.original;

            return (
                <p className="tabular-nums">
                    {new Date(organization.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    })}
                </p>
            );
        },
    },
    {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
            const organization = row.original;

            return (
                <>
                    <OrganizationsPageColumnActions organization={organization} />
                </>
            );
        },
    },
];
