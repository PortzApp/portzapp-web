# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**

```bash
composer run dev
```

This runs the Laravel app, queue worker, Vite dev server, log viewer, and WebSocket server concurrently.

**IMPORTANT:** The development server is typically running in the background during development sessions. Do NOT attempt to start/restart `composer run dev` or `npm run dev` unless explicitly requested, as these are usually already running. Other npm/composer scripts (lint, test, format, etc.) can be run safely.

**Build frontend:**

```bash
npm run build
```

**Database operations:**

```bash
php artisan migrate:fresh --seed    # Reset and seed database
composer run db:seed                # Alias for the above
```

**Testing:**

```bash
composer test                       # Run all tests (unit, lint, spellcheck, types, refactor)
composer run test:unit              # Run Pest unit tests only
composer run test:lint              # Run ESLint (frontend) and Pint (backend)
composer typecheck                  # Run PHPStan static analysis
composer run test:spellcheck        # Run Peck spellchecker
```

**IMPORTANT:** Use **Pest PHP** exclusively for all testing. Do not write PHPUnit tests. All tests should use Pest syntax with `it()`, `expect()`, and `describe()` functions.

**CRITICAL:** When writing tests, ALWAYS use Pest - never PHPUnit. This is a strict requirement for all new tests and test modifications.

**Linting and formatting:**

```bash
npm run lint:fix                    # Fix ESLint issues
npm run format:fix                  # Fix Prettier formatting
composer lint:backend               # Run Laravel Pint
```

## Architecture Overview

**Laravel Conventions:**

- Follow **Laravel 12** conventions for all implementations
- Adhere to official Laravel best practices and patterns

### Multi-tenant Organization System

The application uses a multi-organization architecture where:

- **Users** can belong to multiple **Organizations** via pivot table `organization_user` with roles
- Each User has a `current_organization_id` for context switching
- **Organizations** have business types: `shipping_agency`, `vessel_owner`, `portzapp_team`
- **PortzApp Team** users have super-admin access to manage ports and all organizations

### Core Models and Relationships

- **User** ↔ **Organization** (many-to-many with roles)
- **Organization** → **Vessel** (one-to-many)
- **Organization** → **Service** (one-to-many)  
- **Vessel** ↔ **Service** via **Order** (many-to-many)

### Role-Based Access Control

User roles (`app/Enums/UserRoles.php`):

- `ADMIN`, `CEO`, `MANAGER`, `OPERATIONS`, `FINANCE`, `VIEWER`

Access control patterns:

- `EnsurePortzappTeamBusinessType` middleware restricts routes to PortzApp team members
- Use `$user->isInOrganizationWithBusinessType()` and `$user->getRoleInCurrentOrganization()` for authorization

### Frontend Architecture

**Stack:** Laravel + Inertia.js + React + TypeScript + Tailwind CSS

**Key patterns:**

- Inertia.js for SPA-like experience without API
- **Always prefer using Inertia.js router helpers** (`router.get()`, `router.post()`, `router.patch()`, `router.delete()`) to make requests to Laravel backend controllers instead of manual `fetch()` calls
- **Always use Ziggy route helpers** (`route('route.name')`) instead of hardcoded URLs when making requests with Inertia router
- **Prefer `unknown` type over `any`** when dealing with type issues - `unknown` is safer and forces type checking
- **NEVER use `any` type** - it defeats TypeScript's purpose and should be avoided at all costs. Use proper typing or `unknown` instead
- Radix UI components with custom styling
- Tailwind CSS with custom design system
- TypeScript for type safety

**UI Components location:** `resources/js/components/ui/`

**Component Guidelines:**
- Use **shadcn/ui** components for all frontend UI components
- shadcn/ui components are stored in `resources/js/components/ui/` folder
- Always use **Lucide** icon library for icons on the frontend

**Toast Notifications:**
- Always use **Sonner** toasts via `import { toast } from 'sonner'` for all toast notifications
- The `<Toaster />` component from `@/components/ui/sonner` is included in both `AppLayout` and `AuthLayout`
- Pages using either layout can directly use `toast()` without adding `<Toaster />`
- For standalone pages not using these layouts, add `<Toaster />` manually
- Prefer the shadcn/ui components in `resources/js/components/ui/` directory for all UI needs
- These are React components from shadcn/ui, pre-configured with our design system

### Database

**Development databases:**

- **SQLite** (default, quick setup): `database/database.sqlite`
- **PostgreSQL** (recommended): Docker container on port 5400

**Primary Keys:** All table primary keys use ULIDs (Universally Unique Lexicographically Sortable Identifiers) as strings, not numeric auto-incrementing IDs.

**Switching databases:** Update `.env` `DB_CONNECTION` and related vars per README

### Development Services

**Docker services** (`docker-compose.yml`):

- PostgreSQL database: `localhost:5400`
- Adminer (DB viewer): `localhost:8900`
- Mailpit (email testing): `localhost:8025`

### Key Enums

- `OrganizationBusinessType`: Defines organization types
- `UserRoles`: User permission levels within organizations
- `VesselType`, `VesselStatus`: Vessel categorization
- `ServiceStatus`, `OrderStatus`: Workflow states

**Enum Guidelines:**

- **PHP Enums**: Create string-backed enums in `app/Enums/` for all enumerated values
- **Database Schema**: Use string columns for enum-like values in migrations
- **Model Casting**: Cast enum columns to string-backed enums in Laravel models
- **Enum Labels**: Implement `labels()` method on all enum classes for UI display
- **TypeScript Types**: Create corresponding TypeScript enum-like objects in `resources/js/types/enums/index.ts` for frontend use

Example pattern:
```php
// PHP Enum
enum OrderStatus: string
{
    case DRAFT = 'draft';
    case PENDING = 'pending';
    
    public static function labels(): array
    {
        return [
            self::DRAFT->value => 'Draft',
            self::PENDING->value => 'Pending',
        ];
    }
}

// TypeScript equivalent
export const OrderStatus = {
    DRAFT: 'draft',
    PENDING: 'pending',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
```

### Testing Framework

- **Pest PHP** for backend testing (use exclusively, no PHPUnit)
- **ESLint + Prettier** for frontend code quality
- **Peck** for spellchecking
- **PHPStan with Larastan** for static analysis and type safety

#### Test Directory Structure

```
tests/
├── Unit/
│   ├── Policies/           # Policy authorization tests
│   └── Models/             # Model-specific unit tests
├── Feature/
│   ├── Http/
│   │   ├── Controllers/    # Controller integration tests
│   │   └── Auth/          # Authentication flow tests
│   └── Settings/          # Settings-related tests
├── Pest.php               # Pest configuration
└── TestCase.php          # Base test case
```

All tests must use Pest syntax with `it()`, `expect()`, `describe()`, and `beforeEach()` functions.

### Seeded Test Data

Users are seeded with `password` as the password:

- Shipping agencies: `admin@shipping1.com`, `viewer@shipping1.com`, etc.
- Vessel owners: `admin@vessels1.com`, `viewer@vessels1.com`, etc.  
- PortzApp team: `admin@portzapp.com`, `viewer@portzapp.com`

## Development Workflow

1. **Setup:** Follow README installation steps
2. **Database:** Use `php artisan migrate:fresh --seed` to reset data
3. **Development:** Use `composer run dev` for hot reloading
4. **Testing:** Run `composer test` before committing
5. **Frontend changes:** Use `npm run lint:fix` and `npm run format:fix`

## Git Commit Guidelines

When Claude Code makes commits, always include co-authors in this order:

1. The primary user (Aryan Prince <aryan@portzapp.com>)
2. Claude Code (<noreply@anthropic.com>)

Example commit format:

```
feat: Add new feature description

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Aryan Prince <aryan@portzapp.com>
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Linear Issue Management Workflow

**Creating Linear Issues:**

1. Use Linear MCP to create issues in appropriate projects (e.g., "Platform Hardening & Stability")
2. Provide clear problem description, root cause analysis, and acceptance criteria
3. Always create feature branches based on Linear issue branch names

**Feature Branch Convention:**

- Format: `aryan/[issue-identifier]-[short-description]`
- Example: `aryan/dev-108-fix-failing-ordercontroller-and-servicecontroller-tests`
- Always work on feature branches, never directly on main

**Workflow Steps:**

1. **Before any work:** Either use existing issue's feature branch OR create new Linear issue first
2. **Switch to main and sync:** `git checkout main && git fetch && git pull` to get latest changes
3. **Create feature branch** from Linear issue's suggested branch name
4. **Implement changes** and test thoroughly
5. **Update tests:** Ensure all tests are updated and passing for every issue
6. **Run `composer test`** locally to verify all tests pass before committing
7. **Commit** with proper co-authorship (user first, then Claude)
8. **Create PR** using GitHub MCP with proper summary and test plan

**Commit Strategy for Feature Work:**

- Make logical, atomic commits as you complete sub-tasks
- Each commit should represent a completed logical piece of work
- Use descriptive commit messages that explain what was accomplished
- Example progression:
  1. First commit: Implement core logic/policy
  2. Second commit: Add comprehensive tests
  3. Third commit: Fix any issues discovered during testing
  4. Fourth commit: Update documentation

**PR Title Convention:**

- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Do NOT suffix with Linear issue ID in brackets (GitHub automatically links via branch name)
- Examples:
  - `feat: Add user authentication system`
  - `fix: Resolve database connection timeout`
  - `docs: Update API documentation`

## RBAC Policy Implementation Guidelines

When implementing Laravel policies for RBAC:

**Policy Structure:**

- Use standard Laravel policy signatures: `User $user, Model $model` (not optional parameters)
- Implement all standard methods: `viewAny()`, `view()`, `create()`, `update()`, `delete()`
- Register policies in `AppServiceProvider::boot()` using `Gate::policy()`

**Organization-Based Access Control:**

- Use `$user->isInOrganizationWithBusinessType()` to check organization type
- Use `$user->isInOrganizationWithUserRole()` to check user role
- Use `$user->current_organization_id` to check resource ownership
- PORTZAPP_TEAM users typically have super-admin access to all resources

**Common RBAC Patterns:**

- **SHIPPING_AGENCY + ADMIN**: Full CRUD on own organization's resources
- **SHIPPING_AGENCY + VIEWER**: View own organization's resources only  
- **VESSEL_OWNER**: Typically view-only access to all resources for ordering
- **PORTZAPP_TEAM**: Super-admin access across all organizations

**Testing RBAC:**

- Test all permission combinations (organization type × user role)
- Test cross-organization restrictions (users can't access other org's data)
- Test both positive (allowed) and negative (forbidden) scenarios
- Use proper test data setup with `current_organization_id` set correctly

**Middleware Integration:**

- Fix `HandleInertiaRequests` to use correct policy method calls:
  - Use `viewAny` for generic view permissions (not `view` without model)
  - Use `create` for generic edit/delete permission checks
  - Never call `view`/`update`/`delete` without a model instance

## Controller Guidelines

**Controller Types:**

- **Resource Controllers**: Preferred for standard CRUD operations following RESTful conventions
- **Invokable Controllers**: Use for standalone endpoints that don't fit standard resource patterns
- Follow **Laravel 12** conventions for all controller implementations

**Form Request Usage:**

- Always use FormRequests in controllers when possible for validation and data handling
- Create specific request classes for each action that requires validation

**Authorization Pattern:**

- Always use `Gate::authorize()` at the beginning of every controller method for consistency
- Even when using FormRequests with `authorize()` methods, still use `Gate::authorize()` in the controller
- This ensures consistent authorization patterns across all controller methods regardless of whether they use FormRequests

**Inertia.js Response Guidelines:**

- **CRITICAL**: All Laravel controllers MUST return Inertia-compatible responses when the frontend uses Inertia.js router helpers
- **NEVER return `JsonResponse`** from controllers when using Inertia router - this breaks the Inertia flow
- **Use proper Inertia responses**:
  - Success responses: `return back()->with(['data' => $data])`
  - Redirect responses: `return to_route('route.name')->with(['data' => $data])`
  - Error responses: `return back()->withErrors(['field' => 'error message'])`
  - Validation errors: `return back()->withErrors($validator->errors())`
- **Avoid manual JSON responses** like `response()->json()` in controllers serving Inertia pages
- **Frontend expectation**: When using `router.post()`, `router.patch()`, `router.delete()`, etc., Laravel must respond with Inertia-compatible responses
- **Error pattern**: "All Inertia requests must receive a valid Inertia response, however a plain JSON response was received" indicates improper response type

## Important Files

- `routes/web.php`: Main application routes with middleware
- `app/Http/Middleware/EnsurePortzappTeamBusinessType.php`: Super admin access control
- `resources/js/types/index.d.ts`: TypeScript type definitions
- `app/Models/User.php`: User model with organization methods
- `database/seeders/UserSeeder.php`: Test user creation

## GitHub PR Guidelines

**PR Description Best Practices:**

- Whenever you make PR descriptions on GitHub, these bits slip up in the commit description:

```
$(cat <<'EOF'

// PR here

EOF
)
```

You can probably not pass this info in when you create/modify a PR description.

===

<laravel-boost-guidelines>
=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double check the available parameters.

## URLs
- Whenever you share a project URL with the user you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain / IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation specific for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The 'search-docs' tool is perfect for all Laravel related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel-ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit"
3. Quoted Phrases (Exact Position) - query="infinite scroll" - Words must be adjacent and in that order
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit"
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms


=== inertia-laravel/core rules ===

## Inertia Core

- Inertia.js components should be placed in the `resources/js/Pages` directory unless specified differently in the JS bundler (vite.config.js).
- Use `Inertia::render()` for server-side routing instead of traditional Blade views.

<code-snippet lang="php" name="Inertia::render Example">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>


=== inertia-laravel/v2 rules ===

## Inertia v2

- Make use of all Inertia features from v1 & v2. Check the documentation before making any changes to ensure we are taking the correct approach.

### Inertia v2 New Features
- Polling
- Prefetching
- Deferred props
- Infinite scrolling using merging props and `WhenVisible`
- Lazy loading data on scroll

### Deferred Props & Empty States
- When using deferred props on the frontend, you should add a nice empty state with pulsing / animated skeleton.


=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] <name>` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.


=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- No middleware files in `app/Http/Middleware/`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- **No app\Console\Kernel.php** - use `bootstrap/app.php` or `routes/console.php` for console configuration.
- **Commands auto-register** - files in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 11 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.


=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.


=== pest/core rules ===

## Pest

### Testing
- If you need to verify a feature is working, write or update a Unit / Feature test.

### Pest Tests
- All tests must be written using Pest. Use `php artisan make:test --pest <name>`.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files - these are core to the application.
- Tests should test all of the happy paths, failure paths, and weird paths.
- Tests live in the `tests/Feature` and `tests/Unit` directories.
- Pest tests look and behave like this:
<code-snippet name="Basic Pest Test Example" lang="php">
it('is true', function () {
    expect(true)->toBeTrue();
});
</code-snippet>

### Running Tests
- Run the minimal number of tests using an appropriate filter before finalizing code edits.
- To run all tests: `php artisan test`.
- To run all tests in a file: `php artisan test tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --filter=testName` (recommended after making a change to a related file).
- When the tests relating to your changes are passing, ask the user if they would like to run the entire test suite to ensure everything is still passing.

### Pest Assertions
- When asserting status codes on a response, use the specific method like `assertForbidden` and `assertNotFound` instead of using `assertStatus(403)` or similar, e.g.:
<code-snippet name="Pest Example Asserting postJson Response" lang="php">
it('returns all', function () {
    $response = $this->postJson('/api/docs', []);

    $response->assertSuccessful();
});
</code-snippet>

### Mocking
- Mocking can be very helpful when appropriate.
- When mocking, you can use the `Pest\Laravel\mock` Pest function, but always import it via `use function Pest\Laravel\mock;` before using it. Alternatively, you can use `$this->mock()` if existing tests do.
- You can also create partial mocks using the same import or self method.

### Datasets
- Use datasets in Pest to simplify tests which have a lot of duplicated data. This is often the case when testing validation rules, so consider going with this solution when writing tests for validation rules.

<code-snippet name="Pest Dataset Example" lang="php">
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'james' => 'james@laravel.com',
    'taylor' => 'taylor@laravel.com',
]);
</code-snippet>


=== inertia-react/core rules ===

## Inertia + React

- Use `router.visit()` or `<Link>` for navigation instead of traditional links.

<code-snippet lang="react" name="Inertia Client Navigation">
    import { Link } from '@inertiajs/react'

    <Link href="/">Home</Link>
</code-snippet>

- For form handling, use `router.post` and related methods. Do not use regular forms.

<code-snippet lang="react" name="Inertia React Form Example">
import { useState } from 'react'
import { router } from '@inertiajs/react'

export default function Edit() {
    const [values, setValues] = useState({
        first_name: "",
        last_name: "",
        email: "",
    })

    function handleChange(e) {
        const key = e.target.id;
        const value = e.target.value

        setValues(values => ({
            ...values,
            [key]: value,
        }))
    }

    function handleSubmit(e) {
        e.preventDefault()

        router.post('/users', values)
    }

    return (
    <form onSubmit={handleSubmit}>
        <label htmlFor="first_name">First name:</label>
        <input id="first_name" value={values.first_name} onChange={handleChange} />
        <label htmlFor="last_name">Last name:</label>
        <input id="last_name" value={values.last_name} onChange={handleChange} />
        <label htmlFor="email">Email:</label>
        <input id="email" value={values.email} onChange={handleChange} />
        <button type="submit">Submit</button>
    </form>
    )
}
</code-snippet>


=== tailwindcss/core rules ===

## Tailwind Core

- Use Tailwind CSS classes to style HTML, check and use existing tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc..)
- Think through class placement, order, priority, and defaults - remove redundant classes, add classes to parent or child carefully to limit repetition, group elements logically
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing
- When listing items, use gap utilities for spacing, don't use margins.

    <code-snippet name="Valid Flex Gap Spacing Example" lang="html">
        <div class="flex gap-8">
            <div>Superior</div>
            <div>Michigan</div>
            <div>Erie</div>
        </div>
    </code-snippet>


### Dark Mode
- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.


=== tailwindcss/v4 rules ===

## Tailwind 4

- Always use Tailwind CSS v4 - do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff"
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>


### Replaced Utilities
- Tailwind v4 removed deprecated utilities. Do not use the deprecated option - use the replacement.
- Opacity values are still numeric.

| Deprecated |	Replacement |
|------------+--------------|
| bg-opacity-* | bg-black/* |
| text-opacity-* | text-black/* |
| border-opacity-* | border-black/* |
| divide-opacity-* | divide-black/* |
| ring-opacity-* | ring-black/* |
| placeholder-opacity-* | placeholder-black/* |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |


=== tests rules ===

## Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test` with a specific filename or filter.
</laravel-boost-guidelines>

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
