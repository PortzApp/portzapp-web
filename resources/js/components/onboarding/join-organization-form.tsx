import { FormEventHandler } from 'react';

import { useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import InputError from '@/components/input-error';

interface Props {
    onCancel: () => void;
}

export default function JoinOrganizationForm({ onCancel }: Props) {
    const invitationForm = useForm({
        invitation_code: '',
    });

    const joinRequestForm = useForm({
        organization_slug: '',
        message: '',
    });

    const submitInvitation: FormEventHandler = (e) => {
        e.preventDefault();

        // TODO: Implement invitation code redemption
        console.log('Redeeming invitation:', invitationForm.data);

        // invitationForm.post(route('invitations.redeem'), {
        //     onSuccess: () => {
        //         // Redirect to dashboard or complete onboarding
        //     },
        // });
    };

    const submitJoinRequest: FormEventHandler = (e) => {
        e.preventDefault();

        // TODO: Implement join request submission
        console.log('Submitting join request:', joinRequestForm.data);

        // joinRequestForm.post(route('organizations.join-requests.store'), {
        //     onSuccess: () => {
        //         // Show success message and redirect
        //     },
        // });
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="invitation" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="invitation">I have an invitation</TabsTrigger>
                    <TabsTrigger value="request">Request to join</TabsTrigger>
                </TabsList>

                <TabsContent value="invitation" className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-medium">Invitation Code</h3>
                        <p className="text-sm text-muted-foreground">Enter the invitation code you received via email</p>
                    </div>

                    <form onSubmit={submitInvitation} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="invitation_code">
                                Invitation Code
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="invitation_code"
                                type="text"
                                required
                                autoFocus
                                value={invitationForm.data.invitation_code}
                                onChange={(e) => invitationForm.setData('invitation_code', e.target.value)}
                                disabled={invitationForm.processing}
                                placeholder="INV-ABC123..."
                                className="font-mono"
                            />
                            <InputError message={invitationForm.errors.invitation_code} />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={onCancel} disabled={invitationForm.processing} className="flex-1 py-3">
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={invitationForm.processing || !invitationForm.data.invitation_code.trim()}
                                className="flex-1 py-3"
                            >
                                {invitationForm.processing && <LoadingSpinner size="sm" className="mr-2" />}
                                Join Organization
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="request" className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-medium">Request to Join</h3>
                        <p className="text-sm text-muted-foreground">
                            Know the organization's URL? Request to join and they'll review your application
                        </p>
                    </div>

                    <form onSubmit={submitJoinRequest} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="organization_slug">
                                Organization Name
                                <span className="ml-1 text-destructive">*</span>
                            </Label>
                            <Input
                                id="organization_slug"
                                type="text"
                                required
                                value={joinRequestForm.data.organization_slug}
                                onChange={(e) => joinRequestForm.setData('organization_slug', e.target.value)}
                                disabled={joinRequestForm.processing}
                                placeholder="Acme Shipping Co"
                            />
                            <InputError message={joinRequestForm.errors.organization_slug} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Input
                                id="message"
                                type="text"
                                value={joinRequestForm.data.message || ''}
                                onChange={(e) => joinRequestForm.setData('message', e.target.value)}
                                disabled={joinRequestForm.processing}
                                placeholder="Hi, I'd like to join your organization..."
                            />
                            <InputError message={joinRequestForm.errors.message} />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={onCancel} disabled={joinRequestForm.processing} className="flex-1 py-3">
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={joinRequestForm.processing || !joinRequestForm.data.organization_slug.trim()}
                                className="flex-1 py-3"
                            >
                                {joinRequestForm.processing && <LoadingSpinner size="sm" className="mr-2" />}
                                Send Request
                            </Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> These features are currently under development. For now, please contact your organization administrator
                    directly to get access.
                </p>
            </div>
        </div>
    );
}
