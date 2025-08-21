import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Mail, 
    Plus, 
    X, 
    Upload, 
    Users, 
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { UserRoles } from '@/types/enums';

interface InviteUserModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface InvitationForm {
    emails: string[];
    role: UserRoles | '';
    message: string;
    expires_in_days: number;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('single');
    const [formData, setFormData] = useState<InvitationForm>({
        emails: [''],
        role: '',
        message: '',
        expires_in_days: 7
    });
    const [bulkEmails, setBulkEmails] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successResults, setSuccessResults] = useState<{ invitations: any[], errors: Record<string, string> } | null>(null);

    // Handle form field changes
    const handleInputChange = (field: keyof InvitationForm, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Handle single email input
    const handleEmailChange = (index: number, email: string) => {
        const newEmails = [...formData.emails];
        newEmails[index] = email;
        setFormData(prev => ({ ...prev, emails: newEmails }));
        if (errors[`emails.${index}`]) {
            setErrors(prev => ({ ...prev, [`emails.${index}`]: '' }));
        }
    };

    // Add new email field
    const addEmailField = () => {
        setFormData(prev => ({ ...prev, emails: [...prev.emails, ''] }));
    };

    // Remove email field
    const removeEmailField = (index: number) => {
        if (formData.emails.length > 1) {
            const newEmails = formData.emails.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, emails: newEmails }));
        }
    };

    // Parse bulk emails
    const parseBulkEmails = (): string[] => {
        return bulkEmails
            .split(/[,\n\r\t;]+/)
            .map(email => email.trim())
            .filter(email => email.length > 0);
    };

    // Validate email format
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate role
        if (!formData.role) {
            newErrors.role = 'Please select a role for the invitees';
        }

        // Validate emails based on active tab
        let emailsToValidate: string[] = [];
        
        if (activeTab === 'single') {
            emailsToValidate = formData.emails.filter(email => email.trim().length > 0);
            
            if (emailsToValidate.length === 0) {
                newErrors['emails.0'] = 'At least one email address is required';
            } else {
                emailsToValidate.forEach((email, index) => {
                    if (!isValidEmail(email)) {
                        newErrors[`emails.${index}`] = 'Please enter a valid email address';
                    }
                });
            }
        } else {
            emailsToValidate = parseBulkEmails();
            
            if (emailsToValidate.length === 0) {
                newErrors.bulk_emails = 'Please enter at least one email address';
            } else {
                const invalidEmails = emailsToValidate.filter(email => !isValidEmail(email));
                if (invalidEmails.length > 0) {
                    newErrors.bulk_emails = `Invalid email addresses: ${invalidEmails.join(', ')}`;
                }
            }
        }

        // Validate expiration
        if (formData.expires_in_days < 1 || formData.expires_in_days > 30) {
            newErrors.expires_in_days = 'Expiration must be between 1 and 30 days';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const emailsToSend = activeTab === 'single' 
                ? formData.emails.filter(email => email.trim().length > 0)
                : parseBulkEmails();

            const payload = {
                emails: emailsToSend,
                role: formData.role,
                message: formData.message || null,
                expires_in_days: formData.expires_in_days
            };

            const response = await fetch('/api/invitations/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessResults(data);
                if (Object.keys(data.errors).length === 0) {
                    // All invitations sent successfully
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'An error occurred while sending invitations' });
                }
            }
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    // Get role label
    const getRoleLabel = (role: string) => {
        const labels = {
            ADMIN: 'Admin - Full administrative access',
            CEO: 'CEO - Executive access',
            MANAGER: 'Manager - Team and operations management',
            OPERATIONS: 'Operations - Operational management',
            FINANCE: 'Finance - Financial management',
            VIEWER: 'Viewer - View-only access'
        };
        return labels[role as keyof typeof labels] || role;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Invite Users to Organization
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {successResults ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Invitations Sent!</h3>
                                <p className="text-muted-foreground">
                                    {successResults.invitations.length} invitation(s) sent successfully
                                    {Object.keys(successResults.errors).length > 0 && 
                                        `, ${Object.keys(successResults.errors).length} failed`
                                    }
                                </p>
                            </div>

                            {Object.keys(successResults.errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <h4 className="font-medium text-red-800 mb-2">Failed Invitations:</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {Object.entries(successResults.errors).map(([email, error]) => (
                                            <li key={email}>{email}: {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <Button onClick={onClose}>Close</Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input Tabs */}
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="single">Individual Emails</TabsTrigger>
                                    <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                                </TabsList>

                                <TabsContent value="single" className="space-y-4">
                                    <div>
                                        <Label>Email Addresses</Label>
                                        <div className="space-y-2 mt-2">
                                            {formData.emails.map((email, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        type="email"
                                                        placeholder="user@example.com"
                                                        value={email}
                                                        onChange={(e) => handleEmailChange(index, e.target.value)}
                                                        className={errors[`emails.${index}`] ? 'border-red-500' : ''}
                                                    />
                                                    {formData.emails.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeEmailField(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addEmailField}
                                                className="w-full"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Another Email
                                            </Button>
                                        </div>
                                        {errors['emails.0'] && (
                                            <p className="text-sm text-red-600 mt-1">{errors['emails.0']}</p>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="bulk" className="space-y-4">
                                    <div>
                                        <Label htmlFor="bulk_emails">Email Addresses</Label>
                                        <Textarea
                                            id="bulk_emails"
                                            placeholder="Enter multiple email addresses separated by commas or new lines&#10;user1@example.com, user2@example.com&#10;user3@example.com"
                                            value={bulkEmails}
                                            onChange={(e) => setBulkEmails(e.target.value)}
                                            rows={6}
                                            className={errors.bulk_emails ? 'border-red-500' : ''}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Separate email addresses with commas, semicolons, or new lines
                                        </p>
                                        {errors.bulk_emails && (
                                            <p className="text-sm text-red-600 mt-1">{errors.bulk_emails}</p>
                                        )}
                                        {bulkEmails && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium">Preview ({parseBulkEmails().length} emails):</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {parseBulkEmails().slice(0, 10).map((email, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {email}
                                                        </Badge>
                                                    ))}
                                                    {parseBulkEmails().length > 10 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{parseBulkEmails().length - 10} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Role Selection */}
                            <div>
                                <Label htmlFor="role">Role *</Label>
                                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as UserRoles)}>
                                    <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select a role for the invitees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIEWER">{getRoleLabel('VIEWER')}</SelectItem>
                                        <SelectItem value="OPERATIONS">{getRoleLabel('OPERATIONS')}</SelectItem>
                                        <SelectItem value="FINANCE">{getRoleLabel('FINANCE')}</SelectItem>
                                        <SelectItem value="MANAGER">{getRoleLabel('MANAGER')}</SelectItem>
                                        <SelectItem value="ADMIN">{getRoleLabel('ADMIN')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                                )}
                            </div>

                            {/* Personal Message */}
                            <div>
                                <Label htmlFor="message">Personal Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Add a personal message to include with the invitation..."
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formData.message.length}/500 characters
                                </p>
                            </div>

                            {/* Expiration Days */}
                            <div>
                                <Label htmlFor="expires_in_days">Invitation Expires In (Days)</Label>
                                <Input
                                    id="expires_in_days"
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={formData.expires_in_days}
                                    onChange={(e) => handleInputChange('expires_in_days', parseInt(e.target.value) || 7)}
                                    className={errors.expires_in_days ? 'border-red-500' : ''}
                                />
                                {errors.expires_in_days && (
                                    <p className="text-sm text-red-600 mt-1">{errors.expires_in_days}</p>
                                )}
                            </div>

                            {/* General error message */}
                            {errors.general && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-sm text-red-600">{errors.general}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex items-center gap-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !formData.role}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Sending Invitations...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Send Invitations
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InviteUserModal;