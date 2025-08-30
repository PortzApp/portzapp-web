import React, { FormEventHandler, useState } from 'react';

import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InputError from '@/components/input-error';

interface Props {
    organizationId: string;
    onSuccess: (invitesSent: number) => void;
    onSkip: () => void;
    availableRoles: Array<{
        value: string;
        label: string;
    }>;
}

export default function MemberInviteForm({ organizationId, onSuccess, onSkip, availableRoles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        organization_id: organizationId,
        invites: [{ email: '', role: '' }],
    });

    const addInvite = () => {
        setData('invites', [...data.invites, { email: '', role: '' }]);
    };

    const removeInvite = (index: number) => {
        if (data.invites.length > 1) {
            setData('invites', data.invites.filter((_, i) => i !== index));
        }
    };

    const updateInvite = (index: number, field: string, value: string) => {
        const updatedInvites = data.invites.map((invite, i) => 
            i === index ? { ...invite, [field]: value } : invite
        );
        setData('invites', updatedInvites);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        console.log('🚀 Form submission started');
        console.log('📊 Current form data:', data);

        // Filter out empty invites before sending
        const validInvites = data.invites.filter(invite => invite.email.trim() && invite.role);
        console.log('✅ Valid invites found:', validInvites);
        
        if (validInvites.length === 0) {
            console.log('❌ No valid invites to send');
            toast.error('Please fill in at least one invitation with email and role');
            return;
        }

        // Update form data with only valid invites before submission
        console.log('📝 Updating form data with valid invites');
        setData({
            organization_id: data.organization_id,
            invites: validInvites,
        });

        console.log('🌐 Making request to:', route('invitations.bulk-create'));
        post(route('invitations.bulk-create'), {
            onSuccess: (page) => {
                console.log('✅ Form submission successful:', page);
                onSuccess(validInvites.length);
            },
            onError: (errors: Record<string, string>) => {
                console.log('❌ Form submission errors:', errors);
                if (errors.organization_id) {
                    toast.error('Organization Error', {
                        description: errors.organization_id,
                    });
                } else if (errors.bulk_invite) {
                    toast.error('Invitation Error', {
                        description: errors.bulk_invite,
                    });
                } else {
                    const errorMessages = Object.values(errors);
                    if (errorMessages.length > 0) {
                        toast.error('Validation Error', {
                            description: errorMessages[0],
                        });
                    } else {
                        toast.error('Failed to send invitations. Please try again.');
                    }
                }
            },
            onStart: () => {
                console.log('🔄 Request started');
            },
            onFinish: () => {
                console.log('🏁 Request finished');
            },
        });
    };

    const getEmailError = (index: number): string | undefined => {
        return errors[`invites.${index}.email` as keyof typeof errors] as string | undefined;
    };

    const getRoleError = (index: number): string | undefined => {
        return errors[`invites.${index}.role` as keyof typeof errors] as string | undefined;
    };

    return (
        <LoadingOverlay isLoading={processing} message="Sending invitations...">
            <div className="space-y-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        {data.invites.map((invite, index) => (
                            <div key={index} className="grid gap-4 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-medium">Invite #{index + 1}</Label>
                                    {data.invites.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeInvite(index)} disabled={processing}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`email-${index}`}>Email Address</Label>
                                    <Input
                                        id={`email-${index}`}
                                        type="email"
                                        value={invite.email}
                                        onChange={(e) => updateInvite(index, 'email', e.target.value)}
                                        disabled={processing}
                                        placeholder="colleague@company.com"
                                    />
                                    <InputError message={getEmailError(index)} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`role-${index}`}>Role</Label>
                                    <Select value={invite.role} onValueChange={(value) => updateInvite(index, 'role', value)} disabled={processing}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    {role.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={getRoleError(index)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button type="button" variant="outline" onClick={addInvite} disabled={processing || data.invites.length >= 10} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Invite
                        {data.invites.length >= 10 && ' (Maximum reached)'}
                    </Button>

                    {/* General Errors */}
                    <InputError message={errors.organization_id} />
                    <InputError message={errors.invites} />

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6">
                        <Button type="button" variant="outline" onClick={onSkip} disabled={processing} className="flex-1 py-3">
                            Skip for Now
                        </Button>
                        <Button type="submit" disabled={processing} className="flex-1 py-3">
                            {processing ? 'Sending...' : 'Send Invitations'}
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Invitations will expire in 7 days. You can resend or manage invitations from your organization settings.
                    </p>
                </form>
            </div>
        </LoadingOverlay>
    );
}
