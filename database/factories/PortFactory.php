<?php

namespace Database\Factories;

use App\Models\Port;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Port>
 */
class PortFactory extends Factory
{
    /**
     * A list of real-world port data.
     */
    protected array $ports = [
        [
            'name' => 'Jebel Ali Port',
            'city' => 'Dubai',
            'country' => 'United Arab Emirates',
            'code' => 'AEJEA',
            'latitude' => 25.0218,
            'longitude' => 55.0592,
            'timezone' => 'Asia/Dubai',
        ],
        [
            'name' => 'Port of Salalah',
            'city' => 'Salalah',
            'country' => 'Oman',
            'code' => 'OMSLL',
            'latitude' => 16.9533,
            'longitude' => 54.0042,
            'timezone' => 'Asia/Muscat',
        ],
        [
            'name' => 'King Abdullah Port',
            'city' => 'King Abdullah Economic City',
            'country' => 'Saudi Arabia',
            'code' => 'SAKAC',
            'latitude' => 22.5500,
            'longitude' => 39.1250,
            'timezone' => 'Asia/Riyadh',
        ],
        [
            'name' => 'Khalifa Port',
            'city' => 'Abu Dhabi',
            'country' => 'United Arab Emirates',
            'code' => 'AEKHL',
            'latitude' => 24.8105,
            'longitude' => 54.6738,
            'timezone' => 'Asia/Dubai',
        ],
        [
            'name' => 'Jeddah Islamic Port',
            'city' => 'Jeddah',
            'country' => 'Saudi Arabia',
            'code' => 'SAJED',
            'latitude' => 21.4500,
            'longitude' => 39.1667,
            'timezone' => 'Asia/Riyadh',
        ],
        [
            'name' => 'Hamad Port',
            'city' => 'Mesaieed',
            'country' => 'Qatar',
            'code' => 'QAHMD',
            'latitude' => 25.0119,
            'longitude' => 51.6033,
            'timezone' => 'Asia/Qatar',
        ],
        [
            'name' => 'Port Said Port',
            'city' => 'Port Said',
            'country' => 'Egypt',
            'code' => 'EGPSD',
            'latitude' => 31.2667,
            'longitude' => 32.3000,
            'timezone' => 'Africa/Cairo',
        ],
        [
            'name' => 'Damietta Port',
            'city' => 'Damietta',
            'country' => 'Egypt',
            'code' => 'EGDAM',
            'latitude' => 31.4167,
            'longitude' => 31.8167,
            'timezone' => 'Africa/Cairo',
        ],
        [
            'name' => 'Mina Salman',
            'city' => 'Manama',
            'country' => 'Bahrain',
            'code' => 'BHMIN',
            'latitude' => 26.2120,
            'longitude' => 50.6033,
            'timezone' => 'Asia/Bahrain',
        ],
        [
            'name' => 'Shuwaikh Port',
            'city' => 'Kuwait City',
            'country' => 'Kuwait',
            'code' => 'KWSWK',
            'latitude' => 29.3500,
            'longitude' => 47.9500,
            'timezone' => 'Asia/Kuwait',
        ],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $port = fake()->unique()->randomElement($this->ports);

        return [
            'name' => $port['name'],
            'status' => fake()->randomElement([
                'active',
                'inactive',
            ]),
            'city' => $port['city'],
            'country' => $port['country'],
            'code' => $port['code'],
            'latitude' => $port['latitude'],
            'longitude' => $port['longitude'],
            'timezone' => $port['timezone'],

        ];
    }
}
