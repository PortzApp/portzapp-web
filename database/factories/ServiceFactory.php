<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceTypes = [
            'Web Development',
            'Mobile App Development', 
            'SEO Consulting',
            'Social Media Management',
            'Content Writing',
            'Graphic Design',
            'Digital Marketing',
            'Photography',
            'Video Editing',
            'UI/UX Design',
            'Database Management',
            'Cloud Setup',
            'E-commerce Solutions',
            'WordPress Development',
            'Logo Design',
            'Brand Consulting',
            'Email Marketing',
            'PPC Management',
            'Technical Writing',
            'Website Maintenance'
        ];
        
        $descriptions = [
            'Professional and reliable service with quick turnaround times.',
            'High-quality work tailored to your specific business needs.',
            'Experienced specialist offering competitive rates and excellent results.',
            'Custom solutions designed to help your business grow and succeed.',
            'Affordable service without compromising on quality or delivery.',
            'Expert-level work with a focus on modern best practices.',
            'Creative and innovative approach to solve your business challenges.',
            'Proven track record of delivering successful projects on time.',
            'Comprehensive service package including consultation and support.',
            'Results-driven approach with measurable outcomes for your business.'
        ];

        return [
            'name' => fake()->randomElement($serviceTypes),
            'description' => fake()->randomElement($descriptions),
            'price' => fake()->randomFloat(2, 50, 5000), // Between $50 and $5000
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']), // 75% active, 25% inactive
            // user_id will be set when creating the service
        ];
    }
}
