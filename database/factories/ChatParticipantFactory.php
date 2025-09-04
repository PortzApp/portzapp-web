<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatParticipant>
 */
class ChatParticipantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'joined_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'unread_count' => 0,
            'last_read_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 week', 'now'),
        ];
    }

    public function withUnreadMessages(): static
    {
        return $this->state([
            'unread_count' => $this->faker->numberBetween(1, 5),
            'last_read_at' => $this->faker->dateTimeBetween('-3 days', '-1 day'),
        ]);
    }
}
