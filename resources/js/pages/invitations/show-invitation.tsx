import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Shield, Building2, User, Clock, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';

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
    router.post(route('invitations.accept', { token: route().params.token }), {}, {
      onFinish: () => setIsProcessing(false),
    });
  };

  const handleDecline = () => {
    setIsProcessing(true);
    router.post(route('invitations.decline', { token: route().params.token }), {}, {
      onFinish: () => setIsProcessing(false),
    });
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

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              You've been invited to join an organization
            </CardTitle>
            <CardDescription>
              Review the invitation details below and choose your response
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Organization Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="text-center py-4">
                <p className="text-red-600 font-medium mb-2">This invitation has expired</p>
                <p className="text-sm text-gray-600">
                  Please contact {invitation.invited_by.name} to request a new invitation.
                </p>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-gray-600 font-medium mb-2">To accept this invitation, please:</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleLoginToAccept}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In to Accept
                  </Button>
                  <Button
                    onClick={handleRegisterToAccept}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
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
              <div className="text-center py-4">
                <p className="text-amber-600 font-medium mb-2">Email Mismatch</p>
                <p className="text-sm text-gray-600 mb-4">
                  This invitation was sent to <span className="font-medium">{invitation.email}</span>,
                  but you're logged in as <span className="font-medium">{userEmail}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => router.post(route('logout'))}
                    variant="outline"
                    className="flex-1"
                  >
                    Log Out & Use Correct Email
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Accept Invitation'}
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Decline'}
                </Button>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This invitation was sent specifically to {invitation.email}. 
                    Only accept if you recognize the organization and the person who invited you.
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