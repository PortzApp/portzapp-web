import { FormEventHandler } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { ServiceCategory } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import InputError from '@/components/input-error';

type SubCategoryForm = {
    id?: string;
    name: string;
    description?: string;
};

type CategoryForm = {
    name: string;
    sub_categories: SubCategoryForm[];
};

interface EditCategoryPageProps {
    category: ServiceCategory;
}

export default function EditCategoryPage({ category }: EditCategoryPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: route('categories.index'),
        },
        {
            title: category.name,
            href: route('categories.show', category.id),
        },
        {
            title: 'Edit',
            href: route('categories.edit', category.id),
        },
    ];

    const { data, setData, patch, processing, errors } = useForm<CategoryForm>({
        name: category.name,
        sub_categories:
            category.sub_categories?.map((sub) => ({
                id: sub.id,
                name: sub.name,
                description: sub.description || '',
            })) || [],
    });

    const addSubCategory = () => {
        setData('sub_categories', [...data.sub_categories, { name: '', description: '' }]);
    };

    const updateSubCategory = (index: number, field: keyof SubCategoryForm, value: string) => {
        const updatedSubCategories = [...data.sub_categories];
        updatedSubCategories[index] = { ...updatedSubCategories[index], [field]: value };
        setData('sub_categories', updatedSubCategories);
    };

    const removeSubCategory = (index: number) => {
        const filteredSubCategories = data.sub_categories.filter((_: SubCategoryForm, i: number) => i !== index);
        setData('sub_categories', filteredSubCategories);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('categories.update', category.id), {
            onSuccess: () => {
                router.visit(route('categories.index'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Category</h1>
                    <p className="text-base text-muted-foreground">Update the category information and manage its sub-categories.</p>
                </div>

                <div className="grid max-w-4xl gap-8">
                    {/* Category Information */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-medium">Category Information</h2>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter category name"
                                disabled={processing}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                    </div>

                    {/* Sub-Categories Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Sub-Categories</h2>
                            <Button type="button" variant="outline" size="sm" onClick={addSubCategory} disabled={processing}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Sub-Category
                            </Button>
                        </div>

                        {data.sub_categories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sub-categories added yet. Click "Add Sub-Category" to create one.</p>
                        ) : (
                            <div className="space-y-4">
                                {data.sub_categories.map((subCategory: SubCategoryForm, index: number) => (
                                    <div key={subCategory.id || `new-${index}`} className="space-y-4 rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm font-medium">Sub-Category {index + 1}</Label>
                                                {subCategory.id && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Existing</span>
                                                )}
                                                {!subCategory.id && (
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">New</span>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeSubCategory(index)}
                                                disabled={processing}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor={`sub_category_name_${index}`}>
                                                    Name <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id={`sub_category_name_${index}`}
                                                    type="text"
                                                    value={subCategory.name}
                                                    onChange={(e) => updateSubCategory(index, 'name', e.target.value)}
                                                    placeholder="Enter sub-category name"
                                                    disabled={processing}
                                                    required
                                                />
                                                <InputError message={errors[`sub_categories.${index}.name` as keyof typeof errors]} />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor={`sub_category_description_${index}`}>Description</Label>
                                                <Textarea
                                                    id={`sub_category_description_${index}`}
                                                    value={subCategory.description || ''}
                                                    onChange={(e) => updateSubCategory(index, 'description', e.target.value)}
                                                    placeholder="Enter sub-category description (optional)"
                                                    disabled={processing}
                                                    rows={3}
                                                />
                                                <InputError message={errors[`sub_categories.${index}.description` as keyof typeof errors]} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing} className="w-fit">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Category
                    </Button>

                    <Button type="button" variant="outline" onClick={() => router.visit(route('categories.index'))} disabled={processing}>
                        Cancel
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
