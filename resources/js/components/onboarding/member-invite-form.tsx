import React, { FormEventHandler, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import LoadingSpinner, { LoadingOverlay } from '@/components/ui/loading-spinner';

interface MemberInvite {
    email: string;
    role: string;
}

interface Props {
    organizationId: string;
    onSuccess: (invitesSent: number) => void;
    onSkip: () => void;
    availableRoles: Array<{
        value: string;
        label: string;
    }>;
}

interface MemberInviteFormData {
    organization_id: string;
    invites: MemberInvite[];
}

export default function MemberInviteForm({ organizationId, onSuccess, onSkip, availableRoles }: Props) {
    const [invites, setInvites] = useState<MemberInvite[]>([
        { email: '', role: '' }
    ]);

    const { setData, post, processing, errors } = useForm<MemberInviteFormData>({
        organization_id: organizationId,
        invites: invites,
    });

    // Update form data when invites change
    React.useEffect(() => {
        setData('invites', invites);
    }, [invites, setData]);

    const addInvite = () => {
        setInvites([...invites, { email: '', role: '' }]);
    };

    const removeInvite = (index: number) => {
        if (invites.length > 1) {
            setInvites(invites.filter((_, i) => i !== index));
        }
    };

    const updateInvite = (index: number, field: keyof MemberInvite, value: string) => {
        const updated = invites.map((invite, i) => 
            i === index ? { ...invite, [field]: value } : invite
        );
        setInvites(updated);
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getValidInvites = (): MemberInvite[] => {
        return invites.filter(invite => 
            invite.email.trim() !== '' && 
            invite.role !== '' && 
            isValidEmail(invite.email.trim())
        );
    };

    const hasDuplicateEmails = (): boolean => {
        const emails = invites
            .map(invite => invite.email.trim().toLowerCase())
            .filter(email => email !== '');
        return emails.length !== new Set(emails).size;
    };

    const canSubmit = (): boolean => {
        const validInvites = getValidInvites();
        return validInvites.length > 0 && !hasDuplicateEmails() && !processing;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!canSubmit()) {
            return;
        }

        const validInvites = getValidInvites();

        post(route('invitations.bulk-create'), {
            organization_id: organizationId,
            invites: validInvites,
        }, {
            onSuccess: () => {
                onSuccess(validInvites.length);
            },
            onError: (errors) => {
                console.log('Bulk invitation errors:', errors);
            },
        });
    };

    const getRoleDescription = (roleValue: string) => {
        switch (roleValue) {
            case 'admin':
                return 'Full access to all organization settings and data';
            case 'ceo':
                return 'Executive level access with oversight capabilities';
            case 'manager':
                return 'Manage teams and oversee operations';
            case 'operations':
                return 'Handle day-to-day operations and service coordination';
            case 'finance':
                return 'Manage billing, payments, and financial reporting';
            case 'viewer':
                return 'View-only access to organization data';
            default:
                return '';
        }
    };

    const getEmailError = (index: number): string | undefined => {
        const inviteErrors = errors[`invites.${index}` as keyof typeof errors];
        return inviteErrors?.email;
    };

    const getRoleError = (index: number): string | undefined => {
        const inviteErrors = errors[`invites.${index}` as keyof typeof errors];
        return inviteErrors?.role;
    };

    // Validation feedback component
    const ValidationIcon = ({ isValid, hasError }: { isValid: boolean; hasError: boolean }) => {
        if (hasError) {
            return <AlertCircle className="h-4 w-4 text-destructive" />;
        }
        if (isValid) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        return null;
    };

    return (
        <LoadingOverlay 
            isLoading={processing} 
            message="Sending invitations..."
        >
            <div className="space-y-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        {invites.map((invite, index) => (
                            <div key={index} className="grid gap-4 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <Label className="font-medium">
                                        Invite #{index + 1}
                                    </Label>
                                    {invites.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeInvite(index)}
                                            disabled={processing}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`email-${index}`} className="flex items-center gap-2">
                                        Email Address
                                        <ValidationIcon 
                                            isValid={isValidEmail(invite.email.trim()) && !getEmailError(index)} 
                                            hasError={!!getEmailError(index)} 
                                        />
                                    </Label>
                                    <Input
                                        id={`email-${index}`}
                                        type="email"
                                        value={invite.email}
                                        onChange={(e) => updateInvite(index, 'email', e.target.value)}
                                        disabled={processing}
                                        placeholder="colleague@company.com"
                                        className={cn(
                                            getEmailError(index) && 'border-destructive',
                                            isValidEmail(invite.email.trim()) && !getEmailError(index) && invite.email.trim() && 'border-green-500'
                                        )}
                                    />
                                    <InputError message={getEmailError(index)} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`role-${index}`} className="flex items-center gap-2">
                                        Role
                                        <ValidationIcon 
                                            isValid={invite.role !== '' && !getRoleError(index)} 
                                            hasError={!!getRoleError(index)} 
                                        />
                                    </Label>
                                    <Select
                                        value={invite.role}
                                        onValueChange={(value) => updateInvite(index, 'role', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger className={cn(
                                            getRoleError(index) && 'border-destructive',
                                            invite.role && !getRoleError(index) && 'border-green-500'
                                        )}>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role.value} value={role.value}>
                                                    <div>
                                                        <div className="font-medium">{role.label}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {getRoleDescription(role.value)}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={getRoleError(index)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addInvite}
                        disabled={processing || invites.length >= 10}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Invite
                        {invites.length >= 10 && " (Maximum reached)"}
                    </Button>

                    {/* Validation Status */}
                    <div className="space-y-2 text-sm">
                        {hasDuplicateEmails() && (
                            <p className="text-destructive">⚠️ Duplicate email addresses found</p>
                        )}
                        {getValidInvites().length > 0 && (
                            <p className="text-muted-foreground">
                                ✓ {getValidInvites().length} valid invitation{getValidInvites().length !== 1 ? 's' : ''} ready to send
                            </p>
                        )}
                    </div>

                    {/* General Errors */}
                    <InputError message={errors.organization_id} />
                    <InputError message={errors.invites} />

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSkip}
                            disabled={processing}
                            className="flex-1 py-3"
                        >
                            Skip for Now
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit() || processing}
                            className="flex-1 py-3"
                        >
                            {processing && <LoadingSpinner size="sm" className="mr-2" />}
                            {processing ? 'Sending...' : `Send ${getValidInvites().length} Invitation${getValidInvites().length !== 1 ? 's' : ''}`}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        Invitations will expire in 7 days. You can resend or manage invitations from your organization settings.
                    </p>
                </form>
            </div>
        </LoadingOverlay>
    );
}