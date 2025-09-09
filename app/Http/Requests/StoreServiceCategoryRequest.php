<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:service_categories,name',
            'sub_categories' => 'nullable|array',
            'sub_categories.*.name' => 'required|string|max:255',
            'sub_categories.*.description' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The category name is required.',
            'name.unique' => 'A category with this name already exists.',
            'sub_categories.*.name.required' => 'Each sub-category must have a name.',
            'sub_categories.*.name.max' => 'Sub-category names must not exceed 255 characters.',
            'sub_categories.*.description.max' => 'Sub-category descriptions must not exceed 500 characters.',
        ];
    }
}
