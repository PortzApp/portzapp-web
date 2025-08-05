<?php

namespace App\Enums;

enum UserRoles: string
{
    case ADMIN = 'admin';
    case CEO = 'ceo';
    case MANAGER = 'manager';
    case OPERATIONS = 'operations';
    case FINANCE = 'finance';
    case VIEWER = 'viewer';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::CEO => 'CEO',
            self::MANAGER => 'Manager',
            self::OPERATIONS => 'Operations',
            self::FINANCE => 'Finance',
            self::VIEWER => 'Viewer',
        };
    }
}
