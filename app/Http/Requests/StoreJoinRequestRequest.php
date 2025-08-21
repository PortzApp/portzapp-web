<?php

namespace App\Http\Requests;

use App\Enums\JoinRequestStatus;
use App\Models\Organization;
use App\Models\OrganizationJoinRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreJoinRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'organization_id' => [
                'required',
                'string',
                'exists:organizations,id',
                function ($attribute, $value, $fail) {
                    $user = auth()->user();

                    // Check if user is already a member
                    $organization = Organization::find($value);
                    if ($organization && $organization->users()->where('user_id', $user->id)->exists()) {
                        $fail('You are already a member of this organization.');

                        return;
                    }

                    // Check for existing pending request
                    $existingRequest = OrganizationJoinRequest::query()
                        ->where('user_id', $user->id)
                        ->where('organization_id', $value)
                        ->where('status', JoinRequestStatus::PENDING)
                        ->exists();

                    if ($existingRequest) {
                        $fail('You already have a pending join request for this organization.');
                    }
                },
            ],
            'message' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_id.required' => 'Please select an organization to join.',
            'organization_id.exists' => 'The selected organization does not exist.',
            'message.max' => 'Your message cannot exceed 500 characters.',
        ];
    }
}
