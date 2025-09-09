import { FormEventHandler, useId, useState } from 'react';

import { useForm, usePage } from '@inertiajs/react';
import { Building2, Ship } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner, { LoadingOverlay } from '@/components/ui/loading-spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import InputError from '@/components/input-error';

interface Props {
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
    onSuccess: (data: OrganizationFormData) => void;
    onCancel: () => void;
}

export interface OrganizationFormData {
    id?: string;
    name: string;
    slug: string;
    business_type: string;
    registration_code: string;
    description?: string;
}

export default function OrganizationSetupForm({ businessTypes, onSuccess, onCancel }: Props) {
    const radioId = useId();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        business_type: '',
        registration_code: '',
        description: '',
    });

    // Track whether slug has been manually edited by user
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [lastNameUsedForSlug, setLastNameUsedForSlug] = useState('');

    // Get page props at the top level to avoid hooks violations
    const { props } = usePage();

    // Format slug for auto-generation from organization name (full formatting)
    const formatSlug = (input: string): string => {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Minimal formatting for manual input (allows natural typing with hyphens)
    const formatSlugForManualInput = (input: string): string => {
        return input.toLowerCase().replace(/[^a-z0-9-]/g, ''); // Only remove truly invalid characters, keep hyphens
    };

    // Handle name change - reset manual edit flag when name changes
    const handleNameChange = (value: string) => {
        setData('name', value);

        // Reset the manual edit flag when name changes
        // This allows slug to be auto-generated again on next focus
        setIsSlugManuallyEdited(false);
    };

    // Handle slug focus - auto-populate if not manually edited and name exists
    const handleSlugFocus = () => {
        if (!isSlugManuallyEdited && data.name.trim() && data.name !== lastNameUsedForSlug) {
            const formattedSlug = formatSlug(data.name);
            setData('slug', formattedSlug);
            setLastNameUsedForSlug(data.name);
        }
    };

    // Handle slug change - mark as manually edited
    const handleSlugChange = (value: string) => {
        const formattedSlug = formatSlugForManualInput(value);
        setData('slug', formattedSlug);
        setIsSlugManuallyEdited(true);
    };

    // Clean up slug when user finishes editing (optional final cleanup)
    const handleSlugBlur = () => {
        if (data.slug) {
            const cleanedSlug = formatSlug(data.slug);
            setData('slug', cleanedSlug);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('organizations.store.onboarding'), {
            onSuccess: () => {
                // Access flash data from the props already available at the top level
                const flashData = props.flash as {
                    data?: { organization?: { id: string; name: string; slug: string; business_type: string } };
                    message?: string;
                };

                const orgData = flashData?.data?.organization;

                console.log('Organization creation success - flash data:', flashData);
                console.log('Extracted org data:', orgData);

                if (!orgData?.id) {
                    console.warn('Organization ID not found in response. Using form data as fallback.');
                }

                const organizationData = {
                    ...data,
                    id: orgData?.id,
                    name: orgData?.name || data.name,
                    slug: orgData?.slug || data.slug,
                    business_type: orgData?.business_type || data.business_type,
                };

                console.log('Final organization data passed to parent:', organizationData);
                onSuccess(organizationData);
            },
            onError: (errors) => {
                console.log('Organization creation errors:', errors);
            },
        });
    };

    const getBusinessTypeDescription = (type: string) => {
        switch (type) {
            case 'shipping_agency':
                return 'Provide shipping and logistics services to vessel owners';
            case 'vessel_owner':
                return 'Own and operate vessels requiring port services';
            case 'portzapp_team':
                return 'PortzApp team member with administrative access';
            default:
                return '';
        }
    };

    return (
        <LoadingOverlay isLoading={processing} message="Creating your organization...">
            <div className="space-y-6">
                <form onSubmit={submit} className="space-y-8">
                    <div className="grid gap-6">
                        {/* Organization Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                value={data.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                disabled={processing}
                                placeholder="Acme Shipping Co."
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Organization URL/Slug */}
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Organization URL</Label>
                            <Input
                                id="slug"
                                type="text"
                                value={data.slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                onFocus={handleSlugFocus}
                                onBlur={handleSlugBlur}
                                disabled={processing}
                                placeholder="acme-shipping-co"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This will be your organization's unique URL. It can only contain lowercase letters, numbers, and hyphens.
                            </p>
                            <InputError message={errors.slug} />
                        </div>

                        {/* Business Type */}
                        <div className="grid gap-2">
                            <Label>Business Type</Label>
                            <RadioGroup value={data.business_type} onValueChange={(value) => setData('business_type', value)} className="gap-3">
                                {businessTypes
                                    .filter((type) => type.value !== 'portzapp_team') // Hide portzapp_team from regular users
                                    .map((type) => (
                                        <div
                                            key={type.value}
                                            className="relative flex w-full items-start gap-3 rounded-lg border border-input p-4 shadow-sm transition-colors has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5"
                                        >
                                            <RadioGroupItem
                                                value={type.value}
                                                id={`${radioId}-${type.value}`}
                                                className="order-1 after:absolute after:inset-0"
                                            />
                                            <div className="flex grow items-center gap-3">
                                                <div className="shrink-0 rounded-lg bg-muted p-2">
                                                    {type.value === 'shipping_agency' ? (
                                                        <Ship className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="grid grow gap-1">
                                                    <Label htmlFor={`${radioId}-${type.value}`} className="font-medium">
                                                        {type.label}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">{getBusinessTypeDescription(type.value)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </RadioGroup>
                            <InputError message={errors.business_type} />
                        </div>

                        {/* Registration Code */}
                        <div className="grid gap-2">
                            <Label htmlFor="registration_code">Official Government ID Number</Label>
                            <Input
                                id="registration_code"
                                type="text"
                                required
                                value={data.registration_code}
                                onChange={(e) => setData('registration_code', e.target.value)}
                                disabled={processing}
                                placeholder="100123456789012"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your official company registration number (e.g., Trade License Number, Business Registration Number, or in UAE: TRN -
                                100123456789012)
                            </p>
                            <InputError message={errors.registration_code} />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={processing} className="flex-1 py-3">
                            Back
                        </Button>
                        <Button type="submit" disabled={processing} className="flex-1 py-3">
                            {processing && <LoadingSpinner size="sm" className="mr-2" />}
                            {processing ? 'Creating...' : 'Create Organization'}
                        </Button>
                    </div>
                </form>
            </div>
        </LoadingOverlay>
    );
}
