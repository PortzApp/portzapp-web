<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVesselRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'imo_number' => ['nullable', 'string', 'size:7', 'unique:vessels,imo_number'],
            'vessel_type' => ['required', 'string', 'in:bulk_carrier,car_carrier,container_ship,dry_bulk,gas_carrier,naval_ships,passenger_ships,tanker_ship,yacht'],
            'status' => ['required', 'string', 'in:active,inactive,maintenance'],
            'grt' => ['nullable', 'numeric', 'min:0'],
            'nrt' => ['nullable', 'numeric', 'min:0'],
            'dwt' => ['nullable', 'integer', 'min:0'],
            'loa' => ['nullable', 'numeric', 'min:0'],
            'beam' => ['nullable', 'numeric', 'min:0'],
            'draft' => ['nullable', 'numeric', 'min:0'],
            'build_year' => ['nullable', 'integer', 'min:1900', 'max:'.(date('Y') + 1)],
            'mmsi' => ['nullable', 'string', 'size:9', 'regex:/^\d{9}$/', 'unique:vessels,mmsi'],
            'call_sign' => ['nullable', 'string', 'max:10'],
            'flag_state' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
