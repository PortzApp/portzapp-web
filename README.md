# PortzApp Web

This is the web app for the PortzApp project, built with Laravel + React.

## Tech Stack

- [Laravel](https://laravel.com/) (backend framework)
- [React](https://react.dev/) (frontend framework)
- [Tailwind CSS](https://tailwindcss.com/) (CSS framework)

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

3. Generate an app key in the `.env` file

```bash
php artisan key:generate
```

4. Run the local development PostgreSQL database (using Docker)

```bash
docker compose up -d
```

5. Install PHP dependencies

```bash
composer install
```

6. Install Node.js dependencies

```bash
npm install
```

7. Build frontend

```bash
npm run build
```

8. Run database migrations

```bash
php artisan migrate --seed # This will also seed the database with some test data
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

If emails aren't being sent, check if `MAIL_` related `.env` variables are set correctly according to the `.env.example` file.
