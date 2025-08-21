import { useState } from 'react';
import { Building, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchableOrganization } from '@/types';
import { OrganizationBusinessType } from '@/types/enums';

interface OrganizationCardProps {
    organization: SearchableOrganization;
    onJoinRequest: (organizationId: string) => void;
    isLoading?: boolean;
    showJoinButton?: boolean;
    currentUserOrganizations?: string[];
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

export function OrganizationCard({
    organization,
    onJoinRequest,
    isLoading = false,
    showJoinButton = true,
    currentUserOrganizations = [],
}: OrganizationCardProps) {
    const [isRequesting, setIsRequesting] = useState(false);
    
    const isAlreadyMember = currentUserOrganizations.includes(organization.id);
    
    const handleJoinRequest = async () => {
        if (isRequesting || isAlreadyMember) return;
        
        setIsRequesting(true);
        try {
            await onJoinRequest(organization.id);
        } finally {
            setIsRequesting(false);
        }
    };

    const businessTypeLabel = businessTypeLabels[organization.business_type] || organization.business_type;
    const businessTypeColor = businessTypeColors[organization.business_type] || 'bg-gray-100 text-gray-800 border-gray-200';

    return (
        <Card className="h-full transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg leading-tight truncate">
                                {organization.name}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 truncate">
                                @{organization.slug}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${businessTypeColor} flex-shrink-0 ml-2`}>
                        {businessTypeLabel}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                {organization.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {organization.description}
                    </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>
                            {organization.member_count} member{organization.member_count !== 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    <div className="text-xs">
                        Created {new Date(organization.created_at).toLocaleDateString()}
                    </div>
                </div>
            </CardContent>

            {showJoinButton && (
                <CardFooter className="pt-3">
                    <Button 
                        onClick={handleJoinRequest}
                        disabled={isRequesting || isLoading || isAlreadyMember}
                        className="w-full"
                        variant={isAlreadyMember ? "outline" : "default"}
                    >
                        {isRequesting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Requesting...
                            </>
                        ) : isAlreadyMember ? (
                            'Already a Member'
                        ) : (
                            'Request to Join'
                        )}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}