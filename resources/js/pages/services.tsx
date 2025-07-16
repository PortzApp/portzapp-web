import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: '/services',
    },
];

type Service = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    status: 'active' | 'inactive';
    user_id: number;
    created_at: string;
    updated_at: string;
};

export default function Services({ services }: {services: Service[]}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="rounded-lg border bg-card p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        service.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {service.status}
                                </span>
                            </div>
                            {service.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {service.description}
                                </p>
                            )}
                            <div className="text-2xl font-bold text-primary">
                                ${service.price}
                            </div>
                        </div>
                    ))}
                </div>
                
                {services.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No services found.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
