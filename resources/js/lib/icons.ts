import { 
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
    BarChart3
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