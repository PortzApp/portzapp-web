import { useState } from 'react';

import { router } from '@inertiajs/react';
import { Anchor, Box, Droplets, FileText, Fuel, Heart, Package, Search, Ship, Trash2, Truck, Users, Waves } from 'lucide-react';

import type { ServiceCategory } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { CategorySelectionGrid } from '@/components/category-selection-grid';

interface StepCategoriesProps {
    serviceCategories: ServiceCategory[];
    session: OrderWizardSession | null;
}

// Map category names to appropriate Lucide icons
const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, typeof Box> = {
        'Bunker Supply': Fuel,
        'Crew Change': Users,
        'Diving Service': Waves,
        'Documentation & Shipment': FileText,
        'Freight Forwarding': Truck,
        'Fresh Water Supply': Droplets,
        'Hull Cleaning': Ship,
        'Medical Assistance': Heart,
        'Provision Supply': Package,
        'Spare Parts Delivery': Package,
        'Underwater Inspection': Anchor,
        'Waste Disposal': Trash2,
    };

    return iconMap[categoryName] || Box;
};

export function StepCategories({ serviceCategories, session }: StepCategoriesProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Initialize with session data using category_selections relationship
    const initialCategories = session?.category_selections
        ? serviceCategories.filter((cat) => session.category_selections?.some((sel) => sel.service_category_id === cat.id))
        : [];

    const [tempSelectedCategories, setTempSelectedCategories] = useState<ServiceCategory[]>(initialCategories);
    const [search, setSearch] = useState('');

    const filteredCategories = serviceCategories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()));

    // Convert categories to CategorySelectionGrid format
    const categoryItems = filteredCategories.map((category) => ({
        value: category.id,
        label: category.name,
        icon: getCategoryIcon(category.name),
        subtitle:
            category.services_count !== undefined
                ? `${category.services_count} service${category.services_count !== 1 ? 's' : ''} available`
                : undefined,
        checked: tempSelectedCategories.some((c) => c.id === category.id),
    }));

    const handleCategoryToggle = (categoryId: string, checked: boolean) => {
        const category = serviceCategories.find((c) => c.id === categoryId);
        if (!category) return;

        if (checked) {
            setTempSelectedCategories((prev) => [...prev, category]);
        } else {
            setTempSelectedCategories((prev) => prev.filter((c) => c.id !== category.id));
        }
    };

    const handleContinue = () => {
        if (tempSelectedCategories.length > 0 && session) {
            setIsSaving(true);

            router.patch(
                route('order-wizard-sessions.set-categories', session.id),
                {
                    selected_categories: tempSelectedCategories.map((cat) => cat.id),
                },
                {
                    onSuccess: () => {
                        // Navigate to services step
                        router.visit(route('order-wizard.step.services', { session: session.id }));
                    },
                    onFinish: () => setIsSaving(false),
                },
            );
        }
    };

    const canContinue = tempSelectedCategories.length > 0 && !isSaving;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Category Selection */}
            <div className="space-y-6 lg:col-span-2">
                {/* Header */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Box className="h-5 w-5" />
                        Select Service Categories
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                        Choose the types of services you need for {session?.port?.name || 'your destination port'}. You can select multiple
                        categories.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search service categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>

                {/* Categories Grid */}
                {categoryItems.length > 0 ? (
                    <CategorySelectionGrid items={categoryItems} onItemChange={handleCategoryToggle} />
                ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">No categories found. Try adjusting your search.</div>
                )}
            </div>

            {/* Right: Selection Summary */}
            <div className="lg:col-span-1">
                <Card className="sticky top-6 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Selected Categories
                            {tempSelectedCategories.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">({tempSelectedCategories.length})</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {tempSelectedCategories.length > 0
                                ? 'You will be able to select services from these categories in the next step'
                                : 'Choose the types of services you need. You can select multiple categories.'}
                        </p>

                        {/* Selected Categories List */}
                        <div className="space-y-3">
                            {tempSelectedCategories.length > 0 ? (
                                tempSelectedCategories.map((category) => (
                                    <div key={category.id} className="flex items-start gap-3 rounded-md border bg-background p-3">
                                        {(() => {
                                            const IconComponent = getCategoryIcon(category.name);
                                            return <IconComponent className="mt-0.5 h-4 w-4 text-muted-foreground" />;
                                        })()}
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-foreground">{category.name}</div>
                                            {category.services_count !== undefined && (
                                                <div className="text-xs text-muted-foreground">
                                                    {category.services_count} service{category.services_count !== 1 ? 's' : ''} available
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleCategoryToggle(category.id, false)}
                                            className="text-lg leading-none text-muted-foreground transition-colors hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground italic">No categories selected yet</div>
                            )}
                        </div>

                        {/* Action Button or Help Text */}
                        <div className="border-t pt-4">
                            {canContinue ? (
                                <Button onClick={handleContinue} disabled={isSaving} className="w-full">
                                    {isSaving ? 'Saving...' : 'Continue to Service Selection'}
                                </Button>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground">Select at least one category to continue</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
