import { servicesPageColumns } from '@/components/data-table/page-services/columns';
import { ServicesPageDataTable } from '@/components/data-table/page-services/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Service } from '@/types/core';
import { Head, Link } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: '/services',
    },
];

interface ServiceEvent {
    message: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface ServiceCreatedEvent extends ServiceEvent {
    service: Service;
}

interface ServiceUpdatedEvent extends ServiceEvent {
    service: Service;
}

interface ServiceDeletedEvent extends ServiceEvent {
    serviceId: number;
    serviceName: string;
}

export default function Services({ services: initialServices }: { services: Service[] }) {
    const [services, setServices] = useState(initialServices);

    // Listen for service created events
    useEcho<ServiceCreatedEvent>('services', 'ServiceCreated', ({ service: newService }) => {
        setServices((prevServices) => [newService, ...prevServices]);
    });

    // Listen for service updated events
    useEcho<ServiceUpdatedEvent>('services', 'ServiceUpdated', ({ service: updatedService }) => {
        setServices((prevServices) =>
            prevServices.map((prevService) => (prevService.id === updatedService.id ? { ...prevService, ...updatedService } : prevService)),
        );
    });

    // Listen for service deleted events
    useEcho<ServiceDeletedEvent>('services', 'ServiceDeleted', ({ serviceId }) => {
        setServices((prevServices) => prevServices.filter((service) => service.id !== serviceId));
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Services</h1>

                    <Link href={'/services/create'} className={buttonVariants({ variant: 'default' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Link>
                </div>

                <ServicesPageDataTable columns={servicesPageColumns} data={services} />

                {services.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No services found. Create your first service!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
