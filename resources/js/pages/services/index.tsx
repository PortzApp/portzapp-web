import { ServicesPageColumnActions } from '@/components/data-table/page-services/column-actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Port, ServiceWithRelations } from '@/types/core';
import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Plus, Star } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    service: ServiceWithRelations;
}

interface ServiceUpdatedEvent extends ServiceEvent {
    service: ServiceWithRelations;
}

interface ServiceDeletedEvent extends ServiceEvent {
    serviceId: number;
    serviceName: string;
}

interface ServicesPageProps {
    services: ServiceWithRelations[];
    ports: Port[];
}

export default function Services({ services: initialServices, ports }: ServicesPageProps) {
    const [services, setServices] = useState(initialServices);

    const [portFilter, setPortFilter] = useQueryState(
        'port',
        parseAsString.withDefault('').withOptions({
            shallow: false,
            history: 'push',
        }),
    );

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);

    const handlePortFilterChange = async (value: string) => {
        await setPortFilter(value);
        router.reload({ only: ['services'] });
    };

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

                    {/* <Link href={'/services/create'} className={buttonVariants({ variant: 'default' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Link> */}
                </div>

                {/*<ServicesPageDataTable columns={servicesPageColumns} data={services} />*/}

                <div className="grid grid-cols-12 gap-16">
                    <div className="col-span-3 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h1 className="font-medium">Filters</h1>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="filter_ports" className="py-2">
                                <AccordionTrigger className="py-4 text-[15px] leading-6 hover:no-underline">
                                    <span className="text-sm font-semibold uppercase">Ports</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-2 text-muted-foreground">
                                    <RadioGroup value={portFilter} onValueChange={handlePortFilterChange}>
                                        {ports.map((port) => (
                                            <div className="flex items-center gap-2" key={port.id}>
                                                <RadioGroupItem value={port.name} id={port.id.toString()} />
                                                <Label htmlFor={port.id.toString()}>{port.name}</Label>
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
                                className="flex flex-col gap-2 rounded-xl border bg-card p-6 text-card-foreground shadow-md transition-shadow hover:shadow-lg"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="size-12 rounded-md bg-neutral-200" />
                                    <div className="flex flex-1 flex-col gap-4">
                                        <div className="flex justify-between">
                                            <div className="flex flex-col gap-2">
                                                <Link
                                                    href={route('services.show', service.id)}
                                                    className="text-lg font-semibold hover:underline hover:underline-offset-4"
                                                >
                                                    {service.name}
                                                </Link>
                                                <h3 className="inline-flex items-center gap-2 text-sm font-normal">
                                                    <div className="size-4 rounded-full bg-neutral-200" />
                                                    <span>{service.organization.name}</span>
                                                </h3>
                                            </div>
                                            <ServicesPageColumnActions service={service} />
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
