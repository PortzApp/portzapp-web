import {
    Anchor,
    BarChart3,
    Building,
    CheckCircle,
    Clock,
    DollarSign,
    Package,
    Plus,
    Settings,
    Ship,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';

export const iconMap = {
    Ship,
    Package,
    Clock,
    CheckCircle,
    Settings,
    DollarSign,
    Building,
    Users,
    Anchor,
    Plus,
    TrendingUp,
    TrendingDown,
    BarChart3,
} as const;

export type IconName = keyof typeof iconMap;
