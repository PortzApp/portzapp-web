<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $order = $this->route('order');

        return $this->user()->can('update', $order);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'vessel_id' => ['sometimes', 'exists:vessels,id'],
            'status' => 'sometimes|in:pending,accepted,in_progress,completed,cancelled',
            'notes' => 'sometimes|string|nullable',
        ];
    }
}
