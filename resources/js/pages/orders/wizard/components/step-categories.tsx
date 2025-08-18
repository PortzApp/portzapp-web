import { useState } from 'react';

import { router } from '@inertiajs/react';
import { Anchor, Box, Droplets, FileText, Fuel, Heart, Package, Search, Ship, Trash2, Truck, Users, Waves } from 'lucide-react';

import type { ServiceCategory, ServiceSubCategory } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface StepCategoriesProps {
    serviceCategories: (ServiceCategory & { sub_categories?: ServiceSubCategory[] })[];
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

    // Get all sub-categories from all categories
    const allSubCategories = serviceCategories.flatMap((category) =>
        (category.sub_categories || []).map((subCat) => ({
            ...subCat,
            category: category,
        })),
    );

    // Initialize with session data - find sub-categories that belong to selected categories
    const initialSubCategories = session?.category_selections
        ? allSubCategories.filter((subCat) => session.category_selections?.some((sel) => sel.service_category_id === subCat.category.id))
        : [];

    const [tempSelectedSubCategories, setTempSelectedSubCategories] =
        useState<(ServiceSubCategory & { category: ServiceCategory })[]>(initialSubCategories);
    const [search, setSearch] = useState('');

    // Filter categories and sub-categories based on search
    const filteredCategories = serviceCategories
        .map((category) => ({
            ...category,
            sub_categories: (category.sub_categories || []).filter(
                (subCat) => subCat.name.toLowerCase().includes(search.toLowerCase()) || category.name.toLowerCase().includes(search.toLowerCase()),
            ),
        }))
        .filter((category) => category.name.toLowerCase().includes(search.toLowerCase()) || category.sub_categories.length > 0);

    const handleSubCategoryToggle = (subCategoryId: string, checked: boolean) => {
        const subCategory = allSubCategories.find((sc) => sc.id === subCategoryId);
        if (!subCategory) return;

        if (checked) {
            setTempSelectedSubCategories((prev) => [...prev, subCategory]);
        } else {
            setTempSelectedSubCategories((prev) => prev.filter((sc) => sc.id !== subCategory.id));
        }
    };

    const handleContinue = () => {
        if (tempSelectedSubCategories.length > 0 && session) {
            setIsSaving(true);

            router.patch(
                route('order-wizard-sessions.set-categories', session.id),
                {
                    selected_sub_categories: tempSelectedSubCategories.map((subCat) => subCat.id),
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

    const canContinue = tempSelectedSubCategories.length > 0 && !isSaving;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Category Selection */}
            <div className="space-y-6 lg:col-span-2">
                {/* Header */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Box className="h-5 w-5" />
                        Select Categories
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                        Choose the specific types of services you need for {session?.port?.name || 'your destination port'}.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>

                {/* Sub-Categories grouped by Categories */}
                {filteredCategories.length > 0 ? (
                    <div className="space-y-6">
                        {filteredCategories.map((category) => (
                            <div key={category.id} className="space-y-3">
                                {/* Category Header */}
                                <div className="flex items-center gap-2 border-b pb-2">
                                    {(() => {
                                        const IconComponent = getCategoryIcon(category.name);
                                        return <IconComponent className="h-5 w-5 text-muted-foreground" />;
                                    })()}
                                    <h4 className="text-lg font-semibold">{category.name}</h4>
                                    <span className="text-sm text-muted-foreground">({category.sub_categories?.length || 0} options)</span>
                                </div>

                                {/* Sub-Categories Grid */}
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {category.sub_categories?.map((subCategory) => {
                                        const isSelected = tempSelectedSubCategories.some((sc) => sc.id === subCategory.id);
                                        return (
                                            <div
                                                key={subCategory.id}
                                                className={`relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                        : 'border-border bg-background hover:border-primary/50'
                                                }`}
                                                onClick={() => handleSubCategoryToggle(subCategory.id, !isSelected)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                                                            isSelected
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-muted-foreground'
                                                        }`}
                                                    >
                                                        {isSelected && <span className="text-xs">✓</span>}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h5 className="font-medium text-foreground">{subCategory.name}</h5>
                                                        {subCategory.description && (
                                                            <p className="mt-1 text-xs text-muted-foreground">{subCategory.description}</p>
                                                        )}
                                                        {subCategory.services_count !== undefined && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {subCategory.services_count} service{subCategory.services_count !== 1 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
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
                            {tempSelectedSubCategories.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">({tempSelectedSubCategories.length})</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {tempSelectedSubCategories.length > 0
                                ? 'You will be able to select services from these categories in the next step'
                                : 'Choose the specific types of services you need. You can select multiple categories.'}
                        </p>

                        {/* Selected Sub-Categories List */}
                        <div className="space-y-3">
                            {tempSelectedSubCategories.length > 0 ? (
                                tempSelectedSubCategories.map((subCategory) => (
                                    <div key={subCategory.id} className="flex items-start gap-3 rounded-md border bg-background p-3">
                                        {(() => {
                                            const IconComponent = getCategoryIcon(subCategory.category.name);
                                            return <IconComponent className="mt-0.5 h-4 w-4 text-muted-foreground" />;
                                        })()}
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-foreground">{subCategory.name}</div>
                                            <div className="text-xs text-muted-foreground">from {subCategory.category.name}</div>
                                            {subCategory.services_count !== undefined && (
                                                <div className="text-xs text-muted-foreground">
                                                    {subCategory.services_count} service{subCategory.services_count !== 1 ? 's' : ''} available
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleSubCategoryToggle(subCategory.id, false)}
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
