import { Cell, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface OrganizationDistributionChartProps {
    data: Array<{
        type: string;
        count: number;
    }>;
    title?: string;
    description?: string;
}

const chartConfig = {
    'Vessel Owner': {
        label: 'Vessel Owners',
        color: 'var(--chart-1)',
    },
    'Shipping Agency': {
        label: 'Shipping Agencies',
        color: 'var(--chart-2)',
    },
    'PortzApp Team': {
        label: 'PortzApp Team',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

export function OrganizationDistributionChart({
    data,
    title = 'Organization Distribution',
    description = 'Breakdown of organizations by type',
}: OrganizationDistributionChartProps) {
    const chartData = data.map((item) => ({
        ...item,
        fill: chartConfig[item.type as keyof typeof chartConfig]?.color || 'var(--chart-1)',
    }));

    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="type" />} />
                        <ChartLegend content={<ChartLegendContent nameKey="type" />} />
                        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="type">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
