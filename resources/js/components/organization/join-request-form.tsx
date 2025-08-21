import { useState } from 'react';
import { Building, Users, Send } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { SearchableOrganization } from '@/types';
import { OrganizationBusinessType } from '@/types/enums';

interface JoinRequestFormProps {
    organization: SearchableOrganization;
    onSuccess?: () => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

const businessTypeLabels = {
    [OrganizationBusinessType.SHIPPING_AGENCY]: 'Shipping Agency',
    [OrganizationBusinessType.VESSEL_OWNER]: 'Vessel Owner',
    [OrganizationBusinessType.PORTZAPP_TEAM]: 'PortzApp Team',
};

const businessTypeColors = {
    [OrganizationBusinessType.SHIPPING_AGENCY]: 'bg-blue-100 text-blue-800 border-blue-200',
    [OrganizationBusinessType.VESSEL_OWNER]: 'bg-green-100 text-green-800 border-green-200',
    [OrganizationBusinessType.PORTZAPP_TEAM]: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function JoinRequestForm({
    organization,
    onSuccess,
    onCancel,
    isSubmitting: externalIsSubmitting = false,
}: JoinRequestFormProps) {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const businessTypeLabel = businessTypeLabels[organization.business_type] || organization.business_type;
    const businessTypeColor = businessTypeColors[organization.business_type] || 'bg-gray-100 text-gray-800 border-gray-200';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || externalIsSubmitting) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            await new Promise<void>((resolve, reject) => {
                router.post('/api/join-requests', {
                    organization_id: organization.id,
                    message: message.trim() || undefined,
                }, {
                    onSuccess: () => {
                        toast.success('Join Request Sent', {
                            description: `Your request to join ${organization.name} has been sent successfully.`,
                        });
                        setMessage('');
                        onSuccess?.();
                        resolve();
                    },
                    onError: (responseErrors) => {
                        const formattedErrors: { [key: string]: string } = {};
                        
                        Object.entries(responseErrors).forEach(([key, messages]) => {
                            if (Array.isArray(messages)) {
                                formattedErrors[key] = messages[0];
                            } else {
                                formattedErrors[key] = String(messages);
                            }
                        });
                        
                        setErrors(formattedErrors);
                        
                        const errorMessage = formattedErrors.organization_id || 
                                           formattedErrors.message || 
                                           'Failed to send join request';
                        
                        toast.error('Request Failed', {
                            description: errorMessage,
                        });
                        
                        reject(new Error(errorMessage));
                    },
                });
            });
        } catch (error) {
            // Error already handled in onError callback
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isSubmitting || externalIsSubmitting;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Confirmation */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Join Request Confirmation
                    </CardTitle>
                    <CardDescription>
                        You are requesting to join the following organization:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-foreground mb-1">
                                {organization.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                @{organization.slug}
                            </p>
                            {organization.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                    {organization.description}
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        {organization.member_count} member{organization.member_count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <Badge variant="outline" className={`text-xs ${businessTypeColor}`}>
                                    {businessTypeLabel}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Optional Message */}
            <div className="space-y-2">
                <Label htmlFor="message">
                    Message to Organization Admins (Optional)
                </Label>
                <Textarea
                    id="message"
                    placeholder="Introduce yourself and explain why you'd like to join this organization..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className={errors.message ? 'border-destructive' : ''}
                    disabled={isLoading}
                />
                {errors.message && (
                    <p className="text-sm text-destructive">{errors.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    {message.length}/500 characters
                </p>
            </div>

            {/* General Errors */}
            {errors.organization_id && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{errors.organization_id}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Sending Request...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Send Join Request
                        </>
                    )}
                </Button>
                
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}