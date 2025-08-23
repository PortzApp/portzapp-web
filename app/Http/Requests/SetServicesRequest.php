<?php

namespace App\Http\Requests;

use App\Enums\ServiceStatus;
use App\Models\OrderWizardSession;
use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Validator;

class SetServicesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $session = $this->route('session');

        return Gate::allows('update', $session);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'selected_services' => 'required|array|min:1',
            'selected_services.*' => 'required|string|exists:services,id',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->failed()) {
                return;
            }

            $this->validateOneServicePerSubCategory($validator);
            $this->validateServicesMatchSession($validator);
        });
    }

    /**
     * Validate that only one service is selected per sub-category.
     */
    protected function validateOneServicePerSubCategory(Validator $validator): void
    {
        $selectedServiceIds = $this->input('selected_services', []);

        // Get all selected services with their sub-categories
        $services = Service::whereIn('id', $selectedServiceIds)
            ->with('subCategory')
            ->get();

        // Group services by sub-category ID
        $servicesBySubCategory = $services->groupBy('service_sub_category_id');

        // Check if any sub-category has more than one service selected
        foreach ($servicesBySubCategory as $subCategoryId => $servicesInSubCategory) {
            if ($servicesInSubCategory->count() > 1) {
                $subCategoryName = $servicesInSubCategory->first()->subCategory->name ?? 'Unknown';
                $validator->errors()->add(
                    'selected_services',
                    "Only one service can be selected per sub-category. Multiple services selected for: {$subCategoryName}"
                );
                break;
            }
        }
    }

    /**
     * Validate that selected services match the session's port and selected sub-categories.
     */
    protected function validateServicesMatchSession(Validator $validator): void
    {
        /** @var OrderWizardSession $session */
        $session = $this->route('session');
        $selectedServiceIds = $this->input('selected_services', []);

        // Get session's selected sub-category IDs
        $sessionSubCategoryIds = $session->categorySelections()
            ->pluck('service_sub_category_id')
            ->toArray();

        // Get all selected services with their details
        $services = Service::whereIn('id', $selectedServiceIds)
            ->with(['subCategory', 'organization'])
            ->get();

        foreach ($services as $service) {
            // Validate service belongs to the session's port
            if ($service->port_id !== $session->port_id) {
                $validator->errors()->add(
                    'selected_services',
                    "Service '{$service->organization->name}' does not belong to the selected port."
                );

                continue;
            }

            // Validate service belongs to one of the selected sub-categories
            if (! in_array($service->service_sub_category_id, $sessionSubCategoryIds)) {
                $validator->errors()->add(
                    'selected_services',
                    "Service '{$service->organization->name}' does not belong to any of the selected categories."
                );
            }

            // Validate service is active
            if ($service->status !== ServiceStatus::ACTIVE) {
                $validator->errors()->add(
                    'selected_services',
                    "Service '{$service->organization->name}' is not currently available."
                );
            }
        }
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'selected_services.required' => 'Please select at least one service.',
            'selected_services.min' => 'Please select at least one service.',
            'selected_services.*.exists' => 'One or more selected services are invalid.',
        ];
    }
}
