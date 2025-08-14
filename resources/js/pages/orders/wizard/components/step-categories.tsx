import { useState } from 'react';

import { Box, Check, Search } from 'lucide-react';

import type { ServiceCategory } from '@/types/models';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useOrderWizardStore } from '../stores/order-wizard-store';

interface StepCategoriesProps {
    serviceCategories: ServiceCategory[];
}

export function StepCategories({ serviceCategories }: StepCategoriesProps) {
    const { selectedCategories, selectCategories, isSaving, port } = useOrderWizardStore();
    const [tempSelectedCategories, setTempSelectedCategories] = useState<ServiceCategory[]>(selectedCategories);
    const [search, setSearch] = useState('');

    const filteredCategories = serviceCategories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase()));

    const handleCategoryToggle = (category: ServiceCategory, checked: boolean) => {
        if (checked) {
            setTempSelectedCategories((prev) => [...prev, category]);
        } else {
            setTempSelectedCategories((prev) => prev.filter((c) => c.id !== category.id));
        }
    };

    const handleContinue = async () => {
        if (tempSelectedCategories.length > 0) {
            await selectCategories(tempSelectedCategories);
        }
    };

    const canContinue = tempSelectedCategories.length > 0 && !isSaving;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5" />
                        Select Service Categories
                    </CardTitle>
                    <CardDescription>
                        Choose the types of services you need for {port?.name || 'your destination port'}. You can select multiple categories.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search service categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Categories Grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCategories.map((category) => {
                            const isSelected = tempSelectedCategories.some((c) => c.id === category.id);

                            return (
                                <div
                                    key={category.id}
                                    className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                                    }`}
                                    onClick={() => handleCategoryToggle(category, !isSelected)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id={category.id}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <Label htmlFor={category.id} className="cursor-pointer font-medium">
                                                {category.name}
                                            </Label>
                                            {category.services_count !== undefined && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {category.services_count} service{category.services_count !== 1 ? 's' : ''} available
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredCategories.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">No categories found. Try adjusting your search.</div>
                    )}
                </CardContent>
            </Card>

            {/* Selection Summary */}
            {tempSelectedCategories.length > 0 && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Selected Categories ({tempSelectedCategories.length})</CardTitle>
                        <CardDescription>You will be able to select services from these categories in the next step</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {tempSelectedCategories.map((category) => (
                                <div key={category.id} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                                    <Box className="h-4 w-4" />
                                    <span className="font-medium">{category.name}</span>
                                    <button
                                        onClick={() => handleCategoryToggle(category, false)}
                                        className="ml-1 text-muted-foreground transition-colors hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        {canContinue && (
                            <div className="border-t pt-4">
                                <Button onClick={handleContinue} disabled={isSaving} className="w-full">
                                    {isSaving ? 'Saving...' : 'Continue to Service Selection'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
                Select at least one category to continue. You can choose multiple categories to get services from different providers.
            </div>
        </div>
    );
}
