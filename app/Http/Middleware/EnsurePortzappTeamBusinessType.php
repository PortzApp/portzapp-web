<?php

namespace App\Http\Middleware;

use App\Enums\OrganizationBusinessType;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortzappTeamBusinessType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            abort(403, 'Access denied. Only Portzapp team members can access this resource.');
        }

        return $next($request);
    }
}
