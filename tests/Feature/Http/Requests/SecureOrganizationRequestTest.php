<?php

use App\Http\Requests\SecureOrganizationRequest;
use App\Models\Organization;
use App\Models\User;
use App\Services\InputSanitizationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Cache::flush();
    Storage::fake('public');

    // Create authenticated user
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('SecureOrganizationRequest Authorization', function (): void {
    it('always allows organization requests for authenticated users', function (): void {
        $request = new SecureOrganizationRequest(new InputSanitizationService);

        expect($request->authorize())->toBeTrue();
    });
});

describe('Organization Creation Validation', function (): void {
    it('accepts valid organization data', function (): void {
        $this->post(route('organizations.store'), [
            'name' => 'Acme Corporation',
            'business_type' => 'shipping_agency',
            'description' => 'A great shipping company',
            'website' => 'https://acme.com',
            'phone' => '+1-555-123-4567',
            '_token' => csrf_token(),
        ])->assertSessionDoesntHaveErrors();
    });

    it('requires organization name', function (): void {
        $this->post(route('organizations.store'), [
            'business_type' => 'shipping_agency',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('name');
    });

    it('validates name length limits', function (): void {
        // Test minimum length
        $this->post(route('organizations.store'), [
            'name' => 'A', // Too short
            'business_type' => 'shipping_agency',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('name');

        // Test maximum length
        $longName = str_repeat('a', 256); // Over 255 char limit
        $this->post(route('organizations.store'), [
            'name' => $longName,
            'business_type' => 'shipping_agency',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('name');
    });

    it('sanitizes organization names', function (): void {
        $this->post(route('organizations.store'), [
            'name' => 'Acme<script>alert("xss")</script>Corp',
            'business_type' => 'shipping_agency',
            '_token' => csrf_token(),
        ]);

        $organization = Organization::latest()->first();
        expect($organization->name)->toBe('Acmealert("xss")Corp');
        expect($organization->name)->not->toContain('<script>');
    });

    it('validates business type values', function (): void {
        $validTypes = ['shipping_agency', 'vessel_owner', 'portzapp_team'];

        foreach ($validTypes as $type) {
            $this->post(route('organizations.store'), [
                'name' => 'Test Organization',
                'business_type' => $type,
                '_token' => csrf_token(),
            ])->assertSessionDoesntHaveErrors('business_type');
        }

        // Test invalid type
        $this->post(route('organizations.store'), [
            'name' => 'Test Organization',
            'business_type' => 'invalid_type',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('business_type');
    });

    it('validates website URLs', function (): void {
        // Valid URLs
        $validUrls = [
            'https://example.com',
            'http://company.org',
            'https://www.business.co.uk',
        ];

        foreach ($validUrls as $url) {
            $this->post(route('organizations.store'), [
                'name' => 'Test Company',
                'business_type' => 'shipping_agency',
                'website' => $url,
                '_token' => csrf_token(),
            ])->assertSessionDoesntHaveErrors('website');
        }

        // Invalid URLs
        $invalidUrls = [
            'not-a-url',
            'ftp://invalid-protocol.com',
            'javascript:alert(1)',
        ];

        foreach ($invalidUrls as $url) {
            $this->post(route('organizations.store'), [
                'name' => 'Test Company',
                'business_type' => 'shipping_agency',
                'website' => $url,
                '_token' => csrf_token(),
            ])->assertSessionHasErrors('website');
        }
    });

    it('validates phone number formats', function (): void {
        $validPhones = [
            '+1-555-123-4567',
            '+44-20-7946-0958',
            '+49-89-12345678',
            '(555) 123-4567',
        ];

        foreach ($validPhones as $phone) {
            $this->post(route('organizations.store'), [
                'name' => 'Test Company',
                'business_type' => 'shipping_agency',
                'phone' => $phone,
                '_token' => csrf_token(),
            ])->assertSessionDoesntHaveErrors('phone');
        }

        // Invalid phone numbers
        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'phone' => 'not-a-phone',
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('phone');
    });
});

describe('Organization Slug Generation', function (): void {
    it('generates valid slugs from organization names', function (): void {
        $testCases = [
            'Acme Corporation' => 'acme-corporation',
            'Test & Associates' => 'test-associates',
            'Special Characters !@#' => 'special-characters',
        ];

        foreach ($testCases as $name => $expectedSlug) {
            $this->post(route('organizations.store'), [
                'name' => $name,
                'business_type' => 'shipping_agency',
                '_token' => csrf_token(),
            ]);

            $organization = Organization::latest()->first();
            expect($organization->slug)->toBe($expectedSlug);
        }
    });

    it('handles reserved slug names', function (): void {
        $reservedNames = ['admin', 'api', 'www', 'portzapp'];

        foreach ($reservedNames as $reserved) {
            $this->post(route('organizations.store'), [
                'name' => $reserved,
                'business_type' => 'shipping_agency',
                '_token' => csrf_token(),
            ]);

            $organization = Organization::latest()->first();
            expect($organization->slug)->toBe($reserved.'-company');
        }
    });

    it('ensures slug uniqueness', function (): void {
        // Create first organization
        Organization::factory()->create(['slug' => 'test-company']);

        // Create second organization with same base name
        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            '_token' => csrf_token(),
        ]);

        $newOrganization = Organization::latest()->first();
        expect($newOrganization->slug)->not->toBe('test-company');
        expect($newOrganization->slug)->toStartWith('test-company-');
    });
});

describe('File Upload Validation', function (): void {
    it('validates logo file uploads', function (): void {
        $validLogo = UploadedFile::fake()->image('logo.jpg', 200, 200)->size(500);

        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'logo' => $validLogo,
            '_token' => csrf_token(),
        ])->assertSessionDoesntHaveErrors('logo');
    });

    it('rejects oversized logo files', function (): void {
        $largeLogo = UploadedFile::fake()->image('large.jpg')->size(6144); // 6MB

        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'logo' => $largeLogo,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('logo');
    });

    it('rejects non-image files as logos', function (): void {
        $nonImage = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'logo' => $nonImage,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('logo');
    });

    it('scans uploaded logos for malware', function (): void {
        // Create a file with suspicious content
        $tempFile = tempnam(sys_get_temp_dir(), 'malware_logo');
        file_put_contents($tempFile, '<script>alert("xss")</script>');

        $suspiciousFile = new UploadedFile(
            $tempFile,
            'malware.jpg',
            'image/jpeg',
            null,
            true
        );

        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'logo' => $suspiciousFile,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('logo');

        unlink($tempFile);
    });
});

describe('Security Features', function (): void {
    it('sanitizes input during preparation', function (): void {
        $sanitizer = $this->mock(InputSanitizationService::class);

        $sanitizer->shouldReceive('sanitizeOrganizationName')
            ->with('  Test Company  ')
            ->once()
            ->andReturn('Test Company');

        $sanitizer->shouldReceive('generateOrganizationSlug')
            ->with('Test Company')
            ->once()
            ->andReturn('test-company');

        $request = new SecureOrganizationRequest($sanitizer);
        $request->merge([
            'name' => '  Test Company  ',
            'business_type' => 'shipping_agency',
        ]);

        // Call prepareForValidation through reflection
        $reflection = new \ReflectionClass($request);
        $method = $reflection->getMethod('prepareForValidation');
        $method->setAccessible(true);
        $method->invoke($request);

        expect($request->name)->toBe('Test Company');
        expect($request->slug)->toBe('test-company');
    });

    it('prevents XSS in description fields', function (): void {
        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'description' => 'Great company<script>alert("xss")</script>',
            '_token' => csrf_token(),
        ]);

        $organization = Organization::latest()->first();
        expect($organization->description)->not->toContain('<script>');
        expect($organization->description)->toBe('Great companyalert("xss")');
    });

    it('validates description length limits', function (): void {
        $longDescription = str_repeat('a', 2001); // Over 2000 char limit

        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            'description' => $longDescription,
            '_token' => csrf_token(),
        ])->assertSessionHasErrors('description');
    });

    it('strips dangerous HTML from all text fields', function (): void {
        $dangerousInput = '<iframe src="javascript:alert(1)"></iframe>';

        $this->post(route('organizations.store'), [
            'name' => 'Company'.$dangerousInput,
            'business_type' => 'shipping_agency',
            'description' => 'Description'.$dangerousInput,
            '_token' => csrf_token(),
        ]);

        $organization = Organization::latest()->first();
        expect($organization->name)->not->toContain('<iframe>');
        expect($organization->description)->not->toContain('<iframe>');
        expect($organization->name)->not->toContain('javascript:');
        expect($organization->description)->not->toContain('javascript:');
    });
});

describe('Organization Update Validation', function (): void {
    it('validates organization updates', function (): void {
        $organization = Organization::factory()->create();

        $this->patch(route('organizations.update', $organization), [
            'name' => 'Updated Company Name',
            'description' => 'Updated description',
            'website' => 'https://updated.com',
            '_token' => csrf_token(),
        ])->assertSessionDoesntHaveErrors();
    });

    it('prevents slug changes on updates', function (): void {
        $organization = Organization::factory()->create(['slug' => 'original-slug']);

        $this->patch(route('organizations.update', $organization), [
            'name' => 'Completely Different Name',
            '_token' => csrf_token(),
        ]);

        $organization->refresh();
        expect($organization->slug)->toBe('original-slug'); // Should not change
    });
});

describe('CSRF Protection', function (): void {
    it('requires CSRF token for organization creation', function (): void {
        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            // Missing CSRF token
        ])->assertStatus(419);
    });

    it('rejects invalid CSRF tokens', function (): void {
        $this->post(route('organizations.store'), [
            'name' => 'Test Company',
            'business_type' => 'shipping_agency',
            '_token' => 'invalid_token',
        ])->assertStatus(419);
    });
});
