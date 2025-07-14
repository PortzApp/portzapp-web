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

2. Install PHP dependencies

```bash
composer install
```

3. Install Node.js dependencies

```bash
npm install
```

4. Build frontend

```bash
npm run build
```

5. Run database migrations

```bash
php artisan migrate
```

6. Run web app

```bash
composer run dev
```

7. Head to [http://localhost:8000](http://localhost:8000) to start using the web app.
