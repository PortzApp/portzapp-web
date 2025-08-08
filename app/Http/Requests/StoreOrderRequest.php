<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'service_ids' => ['required'],
            'service_ids.*' => ['exists:services,id'],
            'vessel_id' => ['required', 'exists:vessels,id'],
            'port_id' => 'required|exists:ports,id',
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert single service_id to array format for consistent handling
        if ($this->has('service_ids') && ! is_array($this->service_ids)) {
            $this->merge([
                'service_ids' => [$this->service_ids],
            ]);
        }
    }

    /**
     * Get custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'port_id.required' => 'A port must be selected.',
            'port_id.exists' => 'The selected port is invalid.',
        ];
    }
}
