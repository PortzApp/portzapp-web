import { useState } from 'react';

import { Head, router } from '@inertiajs/react';
import { Building2, Clock, LogIn, Mail, Shield, User, UserPlus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface InvitationData {
    id: string;
    email: string;
    role: string;
    role_label: string;
    expires_at: string;
    organization: {
        id: string;
        name: string;
        business_type: string;
    };
    invited_by: {
        name: string;
        email: string;
    };
}

interface Props {
    invitation: InvitationData;
    auth?: {
        user?: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    };
}

export default function ShowInvitation({ invitation, auth }: Props) {
    const [isProcessing, setIsProcessing] = useState(false);

    const isAuthenticated = !!auth?.user;
    const userEmail = auth?.user?.email;

    const handleAccept = () => {
        setIsProcessing(true);
        router.post(
            route('invitations.accept', { token: route().params.token }),
            {},
            {
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleDecline = () => {
        setIsProcessing(true);
        router.post(
            route('invitations.decline', { token: route().params.token }),
            {},
            {
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleLoginToAccept = () => {
        // Store the token and redirect to login
        sessionStorage.setItem('invitation_token', route().params.token as string);
        router.get(route('login'));
    };

    const handleRegisterToAccept = () => {
        // Store the token and redirect to register
        sessionStorage.setItem('invitation_token', route().params.token as string);
        router.get(route('register'));
    };

    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    const isExpired = expiresAt < now;
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const getRoleVariant = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
            case 'ceo':
                return 'destructive';
            case 'manager':
                return 'default';
            case 'operations':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getBusinessTypeLabel = (businessType: string) => {
        return businessType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <>
            <Head title="Organization Invitation" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">You've been invited to join an organization</CardTitle>
                        <CardDescription>Review the invitation details below and choose your response</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Organization Info */}
                        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-blue-900">Organization Details</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-medium">{invitation.organization.name}</p>
                                <Badge variant="outline" className="text-xs">
                                    {getBusinessTypeLabel(invitation.organization.business_type)}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Invitation Details */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Invited Email</p>
                                        <p className="text-sm text-gray-600">{invitation.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Role</p>
                                        <Badge variant={getRoleVariant(invitation.role)} className="mt-1">
                                            {invitation.role_label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Invited By</p>
                                        <p className="text-sm text-gray-600">{invitation.invited_by.name}</p>
                                        <p className="text-xs text-gray-500">{invitation.invited_by.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Expires</p>
                                        {isExpired ? (
                                            <Badge variant="destructive" className="mt-1">
                                                Expired
                                            </Badge>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}` : 'Today'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        {isExpired ? (
                            <div className="py-4 text-center">
                                <p className="mb-2 font-medium text-red-600">This invitation has expired</p>
                                <p className="text-sm text-gray-600">Please contact {invitation.invited_by.name} to request a new invitation.</p>
                            </div>
                        ) : !isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="py-2 text-center">
                                    <p className="mb-2 font-medium text-gray-600">To accept this invitation, please:</p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Button onClick={handleLoginToAccept} disabled={isProcessing} className="flex-1">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Log In to Accept
                                    </Button>
                                    <Button onClick={handleRegisterToAccept} disabled={isProcessing} variant="outline" className="flex-1">
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Register to Accept
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        Make sure to use the email address: <span className="font-medium">{invitation.email}</span>
                                    </p>
                                </div>
                            </div>
                        ) : userEmail?.toLowerCase() !== invitation.email.toLowerCase() ? (
                            <div className="py-4 text-center">
                                <p className="mb-2 font-medium text-amber-600">Email Mismatch</p>
                                <p className="mb-4 text-sm text-gray-600">
                                    This invitation was sent to <span className="font-medium">{invitation.email}</span>, but you're logged in as{' '}
                                    <span className="font-medium">{userEmail}</span>.
                                </p>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button onClick={() => router.post(route('logout'))} variant="outline" className="flex-1">
                                        Log Out & Use Correct Email
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button onClick={handleAccept} disabled={isProcessing} className="flex-1">
                                    {isProcessing ? 'Processing...' : 'Accept Invitation'}
                                </Button>
                                <Button onClick={handleDecline} disabled={isProcessing} variant="outline" className="flex-1">
                                    {isProcessing ? 'Processing...' : 'Decline'}
                                </Button>
                            </div>
                        )}

                        {/* Security Notice */}
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                            <div className="flex items-start gap-2">
                                <Shield className="mt-0.5 h-4 w-4 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                                    <p className="mt-1 text-xs text-yellow-700">
                                        This invitation was sent specifically to {invitation.email}. Only accept if you recognize the organization and
                                        the person who invited you.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
