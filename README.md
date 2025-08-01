# PortzApp Web

This is the web app for the PortzApp project, built with Laravel + React.

## Tech Stack

- [Laravel](https://laravel.com/) (backend framework)
- [React](https://react.dev/) (frontend framework)
- [Tailwind CSS](https://tailwindcss.com/) (CSS framework)

## Key Info

- Laravel Web App: http://localhost:8000
- Mailpit (for testing emails locally): http://localhost:8025
- Adminer (for viewing data in db): http://localhost:8900

### Other Ports Used

- Laravel Web App: [`8000`](http://localhost:8000) (accessible)
- Laravel Vite Frontend: [`5173`](http://localhost:5173) (not useful)
- Laravel Reverb: `8080` (for handling WebSocket connections)
- [via Docker] PostgreSQL database: `5400` (only for connecting to database in `.env`)
- [via Docker] Adminer Web UI: [`8900`](http://localhost:8900) (accessible, for viewing data in database - similar to
  TablePlus)
- [via Docker] Mailpit Web UI: [`8025`](http://localhost:8025) (accessible, for testing emails locally)
- [via Docker] Mailpit SMTP: `1025` (only for sending emails for local dev in `.env`)

## Getting Started

### Prerequisites

Before installing the dependencies, to install PHP, Composer, and Laravel Installer, you can use the following command:

```bash
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.4)" # on macOS

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4')) # on Windows

/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.4)" # on Linux
```

### Dependencies

- Runtime: [PHP](https://www.php.net/downloads) (8.3+ recommended)
- Runtime: [Node.js](https://nodejs.org/en/download) (20+ recommended)
- Package manager: [Composer](https://getcomposer.org/download/) (2.5+ recommended)

### Installation

1. Clone the repository

```bash
git clone https://github.com/portzapp/portzapp-web.git
```

2. Setup .env file

```bash
cp .env.example .env
```

3. Install PHP dependencies

```bash
composer install
```

4. Install Node.js dependencies

```bash
npm install
```

5. Generate an app key in the `.env` file

```bash
php artisan key:generate
```

6. Run containers for local development using Docker (PostgreSQL for database, Mailpit for emails)

```bash
docker compose up -d
```

7. Build frontend

```bash
npm run build
```

8. Run database migrations (this will also seed your database with some test data)

```bash
php artisan migrate:fresh --seed
```

9. Run web app

```bash
composer run dev
```

10. Head to [http://localhost:8000](http://localhost:8000) to start using the web app.

## Running test suite

### Prerequisites

- [Aspell](https://aspell.net/) (for Peck's spellcheck)

```bash
# on Linux
sudo apt-get install aspell aspell-en

# on macOS
brew install aspell

# on Windows
choco install aspell
```

### Running tests

Run the following command to run the test suite:

```bash
composer test:all
```

This will run:

- Unit tests (Pest)
- Linting (Pint for backend, ESLint for frontend)
- Formatting (Pint for backend, Prettier for frontend)
- Spellcheck (Peck)
- Types (PHPStan w/ LaraStan)
- Refactoring (Rector)

### Running Mailpit for testing emails locally

```bash
docker-compose up -d mailpit
```

Then, head to [http://localhost:8025](http://localhost:8025) to view the emails sent by the web app.

For testing purposes, create a new account to send verification emails, which can be viewed within Mailpit.

If emails aren't being sent, check if `MAIL_` related `.env` variables are set correctly according to the `.env.example`
file.

## Switching between PostgreSQL and SQLite

### Using PostgreSQL (recommended)

1. Run local database container using Docker

```shell
docker-compose up -d
```

2. Update `.env` with the following variables

```shell
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5400
DB_DATABASE=portzapp
DB_USERNAME=dev
DB_PASSWORD=dev
```

3. Run migrations and re-seed database

```shell
php artisan migrate:fresh --seed
```

### Using SQLite (for quick prototyping & less system resource load)

1. Create local SQLite database file

```shell
touch database/database.sqlite
```

2. Update `.env` with the following variables. We only need the `DB_CONNECTION` key.

```shell
DB_CONNECTION=sqlite
#DB_HOST=127.0.0.1
#DB_PORT=5400
#DB_DATABASE=portzapp
#DB_USERNAME=dev
#DB_PASSWORD=dev
```

3. Run migrations and re-seed database

```shell
php artisan migrate:fresh --seed
```

## Recommended steps after new changes

Useful to troubleshoot, after changes made to the codebase.

1. Fetch latest changes

```shell
git fetch && git pull
```

2. Compare your `.env` file with latest `.env.example` file, to see if any new keys to be added

3. Install all PHP and Node.js dependencies

```shell
composer install && npm install
```

4. Re-run all migrations (if new ones are there) and re-seed database

```shell
php artisan migrate:fresh --seed
```

5. Re-build frontend assets, to ensure no errors

```shell
npm run build
```

6. Run application

```shell
composer dev
```
