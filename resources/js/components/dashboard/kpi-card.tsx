import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { iconMap, type IconName } from '@/lib/icons';

interface KPICardProps {
    label: string;
    value: string | number;
    icon: IconName;
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
    description?: string;
}

export function KPICard({ label, value, icon, trend, description }: KPICardProps) {
    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
                <Icon iconNode={iconMap[icon]} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {trend && (
                    <p className={`text-xs ${
                        trend.direction === 'up' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                    }`}>
                        <Icon
                            iconNode={trend.direction === 'up' ? iconMap.TrendingUp : iconMap.TrendingDown}
                            className="mr-1 h-3 w-3 inline"
                        />
                        {trend.value}% from last month
                    </p>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}