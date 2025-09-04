<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatMessage>
 */
class ChatMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message' => $this->faker->sentence(rand(3, 15)),
            'message_type' => 'text',
            'delivered_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }

    public function systemMessage(): static
    {
        return $this->state([
            'message_type' => 'system',
            'message' => $this->faker->randomElement([
                'Order group has been confirmed',
                'Service provider has joined the conversation',
                'Order status updated to In Progress',
                'Documents uploaded',
                'Service completed successfully',
            ]),
        ]);
    }

    public function reply(): static
    {
        return $this->state([
            'message' => $this->faker->randomElement([
                'Thanks for the update!',
                'Got it, will proceed accordingly.',
                'Perfect, let me know if you need anything else.',
                'Sounds good to me.',
                'Understood, thanks for confirming.',
            ]),
        ]);
    }
}
