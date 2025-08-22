<?php

namespace App\Http\Requests;

use App\Enums\OrganizationBusinessType;
use App\Models\Organization;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('create', Organization::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:2',
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                'min:3',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('organizations', 'slug'),
            ],
            'business_type' => [
                'required',
                'string',
                Rule::in(array_map(fn ($case) => $case->value, OrganizationBusinessType::cases())),
            ],
            'registration_code' => [
                'required',
                'string',
                'max:100',
                'min:3',
                Rule::unique('organizations', 'registration_code'),
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Organization name is required.',
            'name.min' => 'Organization name must be at least 2 characters.',
            'name.max' => 'Organization name must not exceed 255 characters.',

            'slug.required' => 'Organization URL is required.',
            'slug.min' => 'Organization URL must be at least 3 characters.',
            'slug.max' => 'Organization URL must not exceed 255 characters.',
            'slug.regex' => 'Organization URL must contain only lowercase letters, numbers, and hyphens.',
            'slug.unique' => 'This organization URL is already taken. Please choose another.',

            'business_type.required' => 'Business type is required.',
            'business_type.in' => 'Please select a valid business type.',

            'registration_code.required' => 'Registration code is required.',
            'registration_code.min' => 'Registration code must be at least 3 characters.',
            'registration_code.max' => 'Registration code must not exceed 100 characters.',
            'registration_code.unique' => 'This registration code is already registered.',

            'description.max' => 'Description must not exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'organization name',
            'slug' => 'organization URL',
            'business_type' => 'business type',
            'registration_code' => 'registration code',
            'description' => 'description',
        ];
    }
}
