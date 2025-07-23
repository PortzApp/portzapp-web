import { Service } from '@/types/service';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { OrderForm } from '@/types/order-form';
import { ServiceForm } from '@/types/service-form';
import { router, useForm } from '@inertiajs/react';
import { LoaderCircle, MoreHorizontal, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';
import InputError from '../../input-error';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

export function ServicesPageColumnActions({ service }: { service: Service }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openNewOrderDialog, setOpenNewOrderDialog] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const serviceForm = useForm<ServiceForm>({
        name: service.name,
        description: service.description || '',
        price: service.price,
        status: service.status,
    });

    const orderForm = useForm<OrderForm>({
        service_id: service.id,
        notes: '',
    });

    const handleDeleteService = () => {
        setIsDeleting(true);
        router.delete(route('services.destroy', service.id), {
            onSuccess: () => {
                setIsDeleting(false);
                setOpenDeleteDialog(false);
                setOpenEditDialog(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleEditService: FormEventHandler = (e) => {
        e.preventDefault();

        serviceForm.put(route('services.update', service.id), {
            onSuccess: () => {
                serviceForm.reset();
            },
        });
    };

    const handleCreateOrder: FormEventHandler = (e) => {
        e.preventDefault();

        orderForm.post(
            route('orders.store'),
            {
                onSuccess: () => {
                    orderForm.reset();
                    setOpenDropdown(false);
                    toast('Order placed successfully!');
                },
            },
        );
    };

    return (
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <Dialog open={openNewOrderDialog} onOpenChange={setOpenNewOrderDialog}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <ShoppingCart />
                            Order
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create new order</DialogTitle>
                            <DialogDescription>Create a new order for the service.</DialogDescription>
                        </DialogHeader>

                        {/* FORM - CREATE ORDER */}
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        type="text"
                                        value={orderForm.data.notes}
                                        onChange={(e) => orderForm.setData('notes', e.target.value)}
                                        placeholder="Enter notes (optional)"
                                        disabled={orderForm.processing}
                                    />
                                    <InputError message={orderForm.errors.notes} />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button" disabled={orderForm.processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button type="submit" disabled={orderForm.processing}>
                                    {orderForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Order
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* DROPDOWN MENU DIALOG - EDIT SERVICE */}
                <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil />
                            Edit
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Service</DialogTitle>
                            <DialogDescription>
                                Update the service information below. Make changes to the service name, description, price, and status.
                            </DialogDescription>
                        </DialogHeader>

                        {/* FORM - EDIT SERVICE */}
                        <form onSubmit={handleEditService} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Service Name</Label>
                                    <Input
                                        id="edit-name"
                                        type="text"
                                        value={serviceForm.data.name}
                                        onChange={(e) => serviceForm.setData('name', e.target.value)}
                                        placeholder="Enter service name"
                                        disabled={serviceForm.processing}
                                        required
                                    />
                                    <InputError message={serviceForm.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Input
                                        id="edit-description"
                                        type="text"
                                        value={serviceForm.data.description}
                                        onChange={(e) => serviceForm.setData('description', e.target.value)}
                                        placeholder="Enter service description (optional)"
                                        disabled={serviceForm.processing}
                                    />
                                    <InputError message={serviceForm.errors.description} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Price</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={serviceForm.data.price}
                                        onChange={(e) => serviceForm.setData('price', e.target.value)}
                                        placeholder="0.00"
                                        disabled={serviceForm.processing}
                                        required
                                    />
                                    <InputError message={serviceForm.errors.price} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select
                                        value={serviceForm.data.status}
                                        onValueChange={(value: 'active' | 'inactive') => serviceForm.setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={serviceForm.errors.status} />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button" disabled={serviceForm.processing}>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button type="submit" disabled={serviceForm.processing}>
                                    {serviceForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Service
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* DROPDOWN MENU DIALOG - DELETE SERVICE */}
                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 />
                            Delete
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Service</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{service.name}"? This action cannot be undone and will permanently remove the service
                                from your account.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isDeleting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button variant="destructive" onClick={handleDeleteService} disabled={isDeleting}>
                                {isDeleting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Delete Service
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
