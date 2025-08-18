import { useEffect, useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Box, MapPin, Plus, RotateCcw, Star } from 'lucide-react';
import { parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { ServiceWithRelations } from '@/types/core';
import { Port, ServiceCategory } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { ServicesPageColumnActions } from './components/data-table/column-actions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: route('services.index'),
    },
];

interface ServiceEvent {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface ServiceCreatedEvent extends ServiceEvent {
    service: ServiceWithRelations;
}

interface ServiceUpdatedEvent extends ServiceEvent {
    service: ServiceWithRelations;
}

interface ServiceDeletedEvent extends ServiceEvent {
    serviceId: string;
    serviceName: string;
}

interface ServicesPageProps {
    services: ServiceWithRelations[];
    ports: Port[];
    service_categories: ServiceCategory[];
}

export default function ServicesIndexPage({ services: initialServices, ports, service_categories }: ServicesPageProps) {
    const { auth } = usePage<SharedData>().props;

    const [services, setServices] = useState(initialServices);

    const [portFilter, setPortFilter] = useQueryState(
        'port',
        parseAsString.withDefault('').withOptions({
            shallow: false,
            history: 'push',
        }),
    );

    const [categoryFilter, setCategoryFilter] = useQueryState(
        'category',
        parseAsString.withDefault('').withOptions({
            shallow: false,
            history: 'push',
        }),
    );

    // Alternative approach using useQueryStates for batch operations
    const [, setFilters] = useQueryStates(
        {
            port: parseAsString.withDefault(''),
            category: parseAsString.withDefault(''),
        },
        {
            shallow: false,
            history: 'push',
        },
    );

    const resetAllFilters = async () => {
        // Clear all filters by setting them to null
        await setFilters(null);
        router.reload({ only: ['services'] });
    };

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);

    // Listen for service created events
    useEcho<ServiceCreatedEvent>('services', 'ServiceCreated', ({ service: newService }) => {
        setServices((prevServices) => [newService, ...prevServices]);

        toast('Service created', {
            description: `ID: #${newService.id} — "${newService.name}"`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', newService.id));
                },
            },
        });
    });

    // Listen for service updated events
    useEcho<ServiceUpdatedEvent>('services', 'ServiceUpdated', ({ service: updatedService }) => {
        setServices((prevServices) =>
            prevServices.map((prevService) => (prevService.id === updatedService.id ? { ...prevService, ...updatedService } : prevService)),
        );

        toast('Service updated', {
            description: `ID: #${updatedService.id} — "${updatedService.name}"`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', updatedService.id));
                },
            },
        });
    });

    // Listen for service deleted events
    useEcho<ServiceDeletedEvent>('services', 'ServiceDeleted', ({ serviceId }) => {
        setServices((prevServices) => prevServices.filter((service) => service.id !== serviceId));

        toast('Service deleted', {
            description: `ID: #${serviceId}`,
            action: {
                label: 'View All',
                onClick: () => {
                    router.visit(route('services.index'));
                },
            },
        });
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Page" />
            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-12 overflow-x-auto rounded-xl p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Services</h1>

                    {auth.user.current_organization?.business_type === 'shipping_agency' && (
                        <Link href={route('services.create')} className={buttonVariants({ variant: 'default' })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                        </Link>
                    )}
                </div>
                {/*<ServicesPageDataTable columns={servicesPageColumns} data={services} />*/}
                {/*<pre>{JSON.stringify(services, null, 2)}</pre>*/}

                <div className="grid grid-cols-12 gap-16">
                    <div className="col-span-3 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h1 className="font-medium">Filters</h1>
                            <Button variant="ghost" size="sm" onClick={resetAllFilters} className="text-xs">
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Reset
                            </Button>
                        </div>

                        <Accordion type="multiple" defaultValue={['filter_ports', 'filter_categories']} className="w-full">
                            <AccordionItem value="filter_ports" className="py-2">
                                <AccordionTrigger className="py-4 text-[15px] leading-6 hover:no-underline">
                                    <span className="text-sm font-semibold uppercase">Ports</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 text-muted-foreground">
                                    <RadioGroup
                                        value={portFilter}
                                        onValueChange={async (value) => {
                                            await setPortFilter(value);
                                            router.reload({ only: ['services'] });
                                        }}
                                    >
                                        {ports.map((port) => (
                                            <div className="flex items-center gap-2" key={port.id}>
                                                <RadioGroupItem value={port.name} id={port.id} />
                                                <Label htmlFor={port.id}>
                                                    {port.name}
                                                    {typeof port.services_count === 'number' && (
                                                        <span className="ml-1 text-muted-foreground">({port.services_count})</span>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="filter_categories" className="py-2">
                                <AccordionTrigger className="py-4 text-[15px] leading-6 hover:no-underline">
                                    <span className="text-sm font-semibold uppercase">Categories</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 text-muted-foreground">
                                    <RadioGroup
                                        value={categoryFilter}
                                        onValueChange={async (value) => {
                                            await setCategoryFilter(value);
                                            router.reload({ only: ['services'] });
                                        }}
                                    >
                                        {service_categories.map((category) => (
                                            <div className="flex items-center gap-2" key={category.id}>
                                                <RadioGroupItem value={category.name} id={category.id} />
                                                <Label htmlFor={category.id}>
                                                    {category.name}
                                                    {typeof category.services_count === 'number' && (
                                                        <span className="ml-1 text-muted-foreground">({category.services_count})</span>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="col-span-9 grid grid-cols-1 gap-4">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="flex h-fit flex-col gap-2 rounded-xl border bg-card p-6 text-card-foreground shadow-md transition-shadow hover:shadow-lg"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="size-12 rounded-md bg-neutral-200" />
                                    <div className="flex flex-1 flex-col gap-4">
                                        <div className="flex justify-between">
                                            <div className="flex flex-col gap-2">
                                                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                                                    <div className="size-4 rounded-full bg-neutral-200" />
                                                    <span>{service.organization.name}</span>
                                                </h3>

                                                <Link
                                                    href={route('services.show', service.id)}
                                                    className="text-base font-medium hover:underline hover:underline-offset-4"
                                                >
                                                    {service.name}
                                                </Link>
                                            </div>
                                            <ServicesPageColumnActions service={service} />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {service.sub_category?.category && (
                                                <Badge variant="secondary">
                                                    <Box className="mr-1 h-3 w-3" />
                                                    {service.sub_category.category.name}
                                                </Badge>
                                            )}
                                            {service.sub_category && (
                                                <Badge variant="outline">
                                                    <Box className="mr-1 h-3 w-3" />
                                                    {service.sub_category.name}
                                                </Badge>
                                            )}
                                            {!service.sub_category && (
                                                <Badge variant="secondary">
                                                    <Box className="mr-1 h-3 w-3" />
                                                    {service.category?.name || 'No Category'}
                                                </Badge>
                                            )}
                                            <Badge variant="secondary">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {service.port.name} ({service.port.country}, {service.port.city})
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <Star fill="#eab308" className="size-4 text-yellow-500" />
                                                <Star fill="#eab308" className="size-4 text-yellow-500" />
                                                <Star fill="#eab308" className="size-4 text-yellow-500" />
                                                <Star fill="#eab308" className="size-4 text-yellow-500" />
                                                <Star className="size-4 text-yellow-500" />
                                            </div>
                                            <span className="text-sm font-normal">(4.0)</span>
                                        </div>

                                        <p className="line-clamp-2 text-sm text-muted-foreground">{service.description || 'No description.'}</p>

                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-medium text-primary">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    }).format(Number(service.price))}
                                                </span>
                                            </div>

                                            <Button variant="outline" size="sm">
                                                <Plus className="size-4" />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {services.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No services found. Create your first service!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
