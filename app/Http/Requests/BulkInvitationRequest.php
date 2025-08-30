<?php

namespace App\Http\Requests;

use App\Enums\UserRoles;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkInvitationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        \Log::info('🔐 BULK INVITATION REQUEST AUTHORIZATION CHECK', [
            'user_authenticated' => auth()->check(),
            'user_id' => auth()->id(),
            'user_email' => auth()->user()?->email,
            'request_url' => $this->url(),
            'request_method' => $this->method(),
            'request_data' => $this->all(),
        ]);

        $authorized = auth()->check();

        \Log::info('🔐 AUTHORIZATION RESULT', [
            'authorized' => $authorized,
            'reason' => $authorized ? 'User is authenticated' : 'User is not authenticated',
        ]);

        return $authorized;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        \Log::info('📋 BULK INVITATION VALIDATION RULES REQUESTED', [
            'request_data' => $this->all(),
            'timestamp' => now()->toDateTimeString(),
        ]);

        $rules = [
            'organization_id' => [
                'required',
                'string',
                'exists:organizations,id',
            ],
            'invites' => [
                'required',
                'array',
                'min:1',
                'max:10',
            ],
            'invites.*.email' => [
                'required',
                'email',
                'max:255',
                'distinct',
            ],
            'invites.*.role' => [
                'required',
                Rule::enum(UserRoles::class),
            ],
        ];

        \Log::info('📋 VALIDATION RULES DEFINED', [
            'rules' => $rules,
        ]);

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'organization_id.required' => 'Organization ID is required.',
            'organization_id.exists' => 'The selected organization does not exist.',
            'invites.required' => 'At least one invitation is required.',
            'invites.min' => 'At least one invitation is required.',
            'invites.max' => 'You can send a maximum of 10 invitations at once.',
            'invites.*.email.required' => 'An email address is required for each invitation.',
            'invites.*.email.email' => 'Please provide valid email addresses.',
            'invites.*.email.distinct' => 'Duplicate email addresses are not allowed.',
            'invites.*.role.required' => 'A role must be selected for each invitation.',
            'invites.*.role.enum' => 'The selected role is invalid.',
        ];
    }
}
