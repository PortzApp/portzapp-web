<?php

namespace App\Enums;

enum InvitationType: string
{
    case USER_INVITATION = 'user_invitation';
    case ORGANIZATION_INVITATION = 'organization_invitation';
    case ORGANIZATION_MEMBER = 'organization_member';

    public static function labels(): array
    {
        return [
            self::USER_INVITATION->value => 'User Invitation',
            self::ORGANIZATION_INVITATION->value => 'Organization Invitation',
            self::ORGANIZATION_MEMBER->value => 'Organization Member',
        ];
    }
}
