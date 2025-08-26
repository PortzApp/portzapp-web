import { FormEventHandler } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { Vessel } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InputError from '@/components/input-error';

export default function EditVesselPage({ vessel }: { vessel: Vessel }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Vessels',
            href: route('vessels.index'),
        },
        {
            title: vessel.name,
            href: `/vessels/${vessel.id}`,
        },
        {
            title: 'Edit',
            href: `/vessels/${vessel.id}/edit`,
        },
    ];

    type VesselForm = Omit<
        Vessel,
        'id' | 'owner_id' | 'created_at' | 'updated_at' | 'organization_id' | 'dwt_in_tons' | 'loa_in_meters' | 'beam_in_meters' | 'draft_in_meters'
    >;

    const { data, setData, put, processing, errors } = useForm<VesselForm>({
        name: vessel.name,
        imo_number: vessel.imo_number,
        vessel_type: vessel.vessel_type,
        status: vessel.status,
        grt: vessel.grt,
        nrt: vessel.nrt,
        dwt: vessel.dwt,
        loa: vessel.loa,
        beam: vessel.beam,
        draft: vessel.draft,
        build_year: vessel.build_year,
        mmsi: vessel.mmsi,
        call_sign: vessel.call_sign,
        flag_state: vessel.flag_state,
        remarks: vessel.remarks,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('vessels.update', vessel.id), {
            onSuccess: () => {
                router.visit(route('vessels.index'), {
                    only: ['vessels'],
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${vessel.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Vessel</h1>
                    <p className="text-base text-muted-foreground">Update vessel information. Only the first three fields are required.</p>
                </div>

                {/* Basic Information Section - Required Fields Only */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-medium">Basic Information</h2>
                        <p className="text-sm text-muted-foreground">Required vessel details</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">
                                Vessel Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter vessel name"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="vessel_type">
                                Vessel Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={data.vessel_type} onValueChange={(value) => setData('vessel_type', value as VesselForm['vessel_type'])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vessel type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bulk_carrier">Bulk Carrier</SelectItem>
                                    <SelectItem value="car_carrier">Car Carrier</SelectItem>
                                    <SelectItem value="container_ship">Container Ship</SelectItem>
                                    <SelectItem value="dry_bulk">Dry Bulk</SelectItem>
                                    <SelectItem value="gas_carrier">Gas Carrier</SelectItem>
                                    <SelectItem value="naval_ships">Naval Ships</SelectItem>
                                    <SelectItem value="passenger_ships">Passenger Ships</SelectItem>
                                    <SelectItem value="tanker_ship">Tanker Ship</SelectItem>
                                    <SelectItem value="yacht">Yacht</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.vessel_type} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status">
                                Vessel Status <span className="text-red-500">*</span>
                            </Label>
                            <Select value={data.status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vessel status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                    </div>
                </div>

                {/* Optional Information Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-medium">Optional Vessel Information</h2>
                        <p className="text-sm text-muted-foreground">
                            These details help streamline order placement. Information will only be shared with your explicit permission when placing
                            orders.
                        </p>
                    </div>

                    {/* Registration Details Subsection */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-md font-medium text-muted-foreground">Registration Details</h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="imo_number">IMO Number</Label>
                                <Input
                                    id="imo_number"
                                    type="text"
                                    value={data.imo_number}
                                    onChange={(e) => setData('imo_number', e.target.value)}
                                    placeholder="7-digit IMO number"
                                    maxLength={7}
                                    disabled={processing}
                                />
                                <InputError message={errors.imo_number} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="flag_state">Flag State</Label>
                                <Input
                                    id="flag_state"
                                    type="text"
                                    value={data.flag_state || ''}
                                    onChange={(e) => setData('flag_state', e.target.value)}
                                    placeholder="Country of registration"
                                    disabled={processing}
                                />
                                <InputError message={errors.flag_state} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="call_sign">Call Sign</Label>
                                <Input
                                    id="call_sign"
                                    type="text"
                                    value={data.call_sign || ''}
                                    onChange={(e) => setData('call_sign', e.target.value.toUpperCase())}
                                    placeholder="Radio call sign (e.g. ABCD1)"
                                    maxLength={10}
                                    disabled={processing}
                                />
                                <InputError message={errors.call_sign} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="mmsi">MMSI</Label>
                                <Input
                                    id="mmsi"
                                    type="text"
                                    value={data.mmsi || ''}
                                    onChange={(e) => setData('mmsi', e.target.value.replace(/\D/g, ''))}
                                    placeholder="9-digit Maritime Mobile Service Identity"
                                    maxLength={9}
                                    disabled={processing}
                                />
                                <InputError message={errors.mmsi} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="build_year">Build Year</Label>
                                <Input
                                    id="build_year"
                                    type="number"
                                    value={data.build_year || ''}
                                    onChange={(e) => setData('build_year', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="Year of construction"
                                    min={1900}
                                    max={new Date().getFullYear() + 1}
                                    disabled={processing}
                                />
                                <InputError message={errors.build_year} />
                            </div>
                        </div>

                        {/* Technical Specifications Subsection */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-md font-medium text-muted-foreground">Technical Specifications</h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="grt">Gross Register Tonnage (GRT)</Label>
                                    <Input
                                        id="grt"
                                        type="number"
                                        step="0.01"
                                        value={data.grt || ''}
                                        onChange={(e) => setData('grt', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Dimensionless value"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.grt} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="nrt">Net Register Tonnage (NRT)</Label>
                                    <Input
                                        id="nrt"
                                        type="number"
                                        step="0.01"
                                        value={data.nrt || ''}
                                        onChange={(e) => setData('nrt', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Dimensionless value"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nrt} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="dwt">Deadweight Tonnage (DWT)</Label>
                                    <Input
                                        id="dwt"
                                        type="number"
                                        value={data.dwt || ''}
                                        onChange={(e) => setData('dwt', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="Weight capacity in tons"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.dwt} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="loa">Length Overall (LOA)</Label>
                                    <Input
                                        id="loa"
                                        type="number"
                                        step="0.1"
                                        value={data.loa || ''}
                                        onChange={(e) => setData('loa', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Length in meters"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.loa} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="beam">Beam</Label>
                                    <Input
                                        id="beam"
                                        type="number"
                                        step="0.1"
                                        value={data.beam || ''}
                                        onChange={(e) => setData('beam', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Width in meters"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.beam} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="draft">Draft</Label>
                                    <Input
                                        id="draft"
                                        type="number"
                                        step="0.1"
                                        value={data.draft || ''}
                                        onChange={(e) => setData('draft', e.target.value ? parseFloat(e.target.value) : null)}
                                        placeholder="Depth in meters"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.draft} />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Subsection */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-md font-medium text-muted-foreground">Additional Information</h3>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <textarea
                                    id="remarks"
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.remarks || ''}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="Additional notes about the vessel..."
                                    maxLength={1000}
                                    disabled={processing}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <InputError message={errors.remarks} />
                                    <span>{(data.remarks || '').length}/1000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing} className="w-fit">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Update Vessel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('vessels.index'))}
                            disabled={processing}
                            className="w-fit"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
