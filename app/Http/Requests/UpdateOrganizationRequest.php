<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateOrganizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if (! $user->current_organization_id) {
            return false;
        }

        return Gate::allows('updateCurrent', \App\Models\Organization::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $organizationId = $user->current_organization_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'registration_code' => [
                'required',
                'string',
                'max:255',
                'unique:organizations,registration_code,'.$organizationId,
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Organization name is required.',
            'name.max' => 'Organization name must not exceed 255 characters.',
            'registration_code.required' => 'Registration code is required.',
            'registration_code.unique' => 'This registration code is already taken.',
            'description.max' => 'Description must not exceed 1000 characters.',
        ];
    }
}
