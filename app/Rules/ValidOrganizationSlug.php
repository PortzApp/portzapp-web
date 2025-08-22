<?php

namespace App\Rules;

use App\Models\Organization;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Cache;

class ValidOrganizationSlug implements ValidationRule
{
    /**
     * Get list of reserved organization slugs.
     */
    private function getReservedSlugs(): array
    {
        return Cache::remember('reserved_organization_slugs', 3600, function () {
            return [
                // System/Admin routes
                'admin', 'api', 'app', 'assets', 'auth', 'blog', 'dashboard',
                'docs', 'help', 'home', 'login', 'logout', 'mail', 'oauth',
                'profile', 'register', 'settings', 'support', 'www',

                // PortzApp specific
                'portzapp', 'portz', 'port', 'ports', 'organization', 'organizations',
                'vessel', 'vessels', 'service', 'services', 'order', 'orders',
                'invitation', 'invitations', 'join', 'member', 'members',

                // Common business terms
                'about', 'contact', 'faq', 'legal', 'privacy', 'terms',
                'security', 'status', 'health', 'metrics', 'monitoring',

                // Technical terms
                'cdn', 'static', 'media', 'uploads', 'downloads', 'files',
                'images', 'css', 'js', 'fonts', 'cache', 'tmp', 'temp',

                // Inappropriate/offensive terms
                'test', 'demo', 'example', 'sample', 'null', 'undefined',
                'admin123', 'password', 'secret', 'private',
            ];
        });
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        // This rule is used in join requests where we validate organization_id
        // We need to find the organization and check its slug
        $organization = Organization::find($value);
        if (! $organization) {
            return; // Let exists validation handle this
        }

        $slug = $organization->slug;

        // Check against reserved slugs
        $reservedSlugs = $this->getReservedSlugs();
        if (in_array(strtolower($slug), array_map('strtolower', $reservedSlugs))) {
            $fail('This organization slug is reserved and cannot be used.');

            return;
        }

        // Additional validation for suspicious patterns
        if (preg_match('/^(admin|root|system|test)\d*$/', strtolower($slug))) {
            $fail('This organization slug contains reserved terms.');

            return;
        }
    }
}
