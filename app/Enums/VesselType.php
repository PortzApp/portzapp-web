<?php

namespace App\Enums;

enum VesselType: string
{
    case CARGO = 'cargo';
    case TANKER = 'tanker';
    case CONTAINER = 'container';
}
