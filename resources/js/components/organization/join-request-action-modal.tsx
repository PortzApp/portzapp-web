import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, User, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { JoinRequest } from '@/types';

interface JoinRequestActionModalProps {
    joinRequest: JoinRequest;
    action: 'approve' | 'reject';
    onClose: () => void;
    onSuccess?: () => void;
}

const JoinRequestActionModal: React.FC<JoinRequestActionModalProps> = ({
    joinRequest,
    action,
    onClose,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        role: action === 'approve' ? 'VIEWER' : '',
        admin_notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const endpoint = action === 'approve' 
                ? `/api/admin/join-requests/${joinRequest.id}/approve`
                : `/api/admin/join-requests/${joinRequest.id}/reject`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess?.();
                onClose();
                // Show success message
                router.reload({ only: ['joinRequests'] });
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'An error occurred' });
                }
            }
        } catch (error) {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isApprove = action === 'approve';
    const actionIcon = isApprove ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
    const actionColor = isApprove ? 'text-green-600' : 'text-red-600';
    const actionBgColor = isApprove ? 'bg-green-50' : 'bg-red-50';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
                <CardHeader className={`${actionBgColor} border-b`}>
                    <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center gap-2 ${actionColor}`}>
                            {actionIcon}
                            {isApprove ? 'Approve' : 'Reject'} Join Request
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            ×
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Request Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Request Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">User</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {joinRequest.user ? 
                                                `${joinRequest.user.first_name} ${joinRequest.user.last_name}` : 
                                                'Unknown User'
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Email</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{joinRequest.user?.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="text-sm font-medium">Requested</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{formatDate(joinRequest.created_at)}</span>
                                    </div>
                                </div>

                                {joinRequest.message && (
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium">User's Message</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm text-gray-700">{joinRequest.message}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Form */}
                        <div className="space-y-4 border-t pt-6">
                            <h3 className="text-lg font-medium">
                                {isApprove ? 'Approval Details' : 'Rejection Details'}
                            </h3>

                            {isApprove && (
                                <div className="space-y-2">
                                    <Label htmlFor="role">Assign Role *</Label>
                                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role for the new member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="VIEWER">Viewer - View only access</SelectItem>
                                            <SelectItem value="OPERATIONS">Operations - Can manage operations</SelectItem>
                                            <SelectItem value="FINANCE">Finance - Can manage finances</SelectItem>
                                            <SelectItem value="MANAGER">Manager - Can manage team and operations</SelectItem>
                                            <SelectItem value="ADMIN">Admin - Full administrative access</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-red-600">{errors.role}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="admin_notes">
                                    {isApprove ? 'Welcome Message (Optional)' : 'Reason for Rejection (Optional)'}
                                </Label>
                                <Textarea
                                    id="admin_notes"
                                    placeholder={isApprove 
                                        ? "Welcome message for the new team member..."
                                        : "Reason for rejecting this request..."
                                    }
                                    value={formData.admin_notes}
                                    onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.admin_notes.length}/1000 characters
                                </p>
                                {errors.admin_notes && (
                                    <p className="text-sm text-red-600">{errors.admin_notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Warning for rejection */}
                        {!isApprove && (
                            <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-800">
                                        This action will reject the join request
                                    </p>
                                    <p className="text-yellow-700 mt-1">
                                        The user will be notified of the rejection. They may submit a new request in the future.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Success confirmation for approval */}
                        {isApprove && (
                            <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-medium text-green-800">
                                        This will add the user to your organization
                                    </p>
                                    <p className="text-green-700 mt-1">
                                        The user will be granted access with the selected role and will be able to access organization resources immediately.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* General error message */}
                        {errors.general && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{errors.general}</p>
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
                                disabled={loading || (isApprove && !formData.role)}
                                className={isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {actionIcon}
                                        {isApprove ? 'Approve & Add to Organization' : 'Reject Request'}
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinRequestActionModal;