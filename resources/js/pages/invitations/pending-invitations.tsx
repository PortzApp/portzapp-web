import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, User, Clock, Mail, Shield } from 'lucide-react';
import { useState } from 'react';

interface InvitationData {
  id: string;
  token: string;
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
  invitations: InvitationData[];
}

export default function PendingInvitations({ invitations }: Props) {
  const [processingTokens, setProcessingTokens] = useState<Set<string>>(new Set());

  const handleAccept = (token: string) => {
    setProcessingTokens(prev => new Set(prev).add(token));
    router.post(route('invitations.accept', { token }), {}, {
      onFinish: () => setProcessingTokens(prev => {
        const next = new Set(prev);
        next.delete(token);
        return next;
      }),
    });
  };

  const handleDecline = (token: string) => {
    setProcessingTokens(prev => new Set(prev).add(token));
    router.post(route('invitations.decline', { token }), {}, {
      onFinish: () => setProcessingTokens(prev => {
        const next = new Set(prev);
        next.delete(token);
        return next;
      }),
    });
  };

  const getRoleVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'ceo':
        return 'destructive' as const;
      case 'manager':
        return 'default' as const;
      case 'operations':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getBusinessTypeLabel = (businessType: string) => {
    return businessType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiresDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry;
  };

  if (invitations.length === 0) {
    return (
      <>
        <Head title="Pending Invitations" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>No Pending Invitations</CardTitle>
              <CardDescription>
                You don't have any pending organization invitations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.get(route('dashboard'))}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Pending Invitations" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Pending Invitations</h1>
            <p className="text-gray-600 mt-1">
              You have {invitations.length} pending organization invitation{invitations.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-4">
            {invitations.map((invitation) => {
              const daysUntilExpiry = getDaysUntilExpiry(invitation.expires_at);
              const isProcessing = processingTokens.has(invitation.token);
              
              return (
                <Card key={invitation.id} className="w-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {invitation.organization.name}
                        </CardTitle>
                        <CardDescription>
                          Invitation to join as {invitation.role_label}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getBusinessTypeLabel(invitation.organization.business_type)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Invitation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Email</p>
                          <p className="text-sm">{invitation.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Role</p>
                          <Badge variant={getRoleVariant(invitation.role)} className="mt-1">
                            {invitation.role_label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Expires</p>
                          <p className="text-sm">
                            {daysUntilExpiry > 0 ? `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}` : 'Today'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Invited By */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Invited by</p>
                        <p className="text-sm">{invitation.invited_by.name}</p>
                        <p className="text-xs text-gray-500">{invitation.invited_by.email}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleAccept(invitation.token)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? 'Processing...' : 'Accept Invitation'}
                      </Button>
                      <Button
                        onClick={() => handleDecline(invitation.token)}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1"
                      >
                        {isProcessing ? 'Processing...' : 'Decline'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => router.get(route('dashboard'))}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}