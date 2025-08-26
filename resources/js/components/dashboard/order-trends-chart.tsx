import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderTrendsChartProps {
    data: Array<{
        month: string;
        orders: number;
    }>;
    title?: string;
    description?: string;
}

const chartConfig = {
    orders: {
        label: 'Orders',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export function OrderTrendsChart({ 
    data, 
    title = 'Order Trends', 
    description = 'Monthly order volume over the last 6 months' 
}: OrderTrendsChartProps) {
    return (
        <Card className="bg-card">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}