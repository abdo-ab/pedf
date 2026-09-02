# PEDF - PDF Editor

[![Build Status](https://github.com/abdo-ab/pedf/actions/workflows/tests.yml/badge.svg)](https://github.com/abdo-ab/pedf/actions/workflows/tests.yml)
[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-3.0-9553E9)](https://inertiajs.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Edit PDFs. Keep the original design.**

A modern, full-stack PDF editing application built with Laravel 13, React 19, and Inertia.js 3. PEDF allows users to edit text-based PDF documents while preserving the original design and layout.

##  Features

-  **Complete Authentication System** - Login, registration, email verification, password reset, and 2FA
-  **PDF Upload & Validation** - Smart detection of text-based vs scanned PDFs
-  **Visual PDF Editor** - Edit text, add images, signatures, and annotations
-  **Non-Destructive Editing** - Preserve original PDF design and formatting
-  **User Dashboard** - Manage documents, view usage, and track edits
-  **Real-time Rendering** - PDF.js-powered document rendering
-  **Secure Storage** - Private document storage with UUID-based access
-  **Modern UI/UX** - Built with Tailwind CSS 4 and shadcn/ui components
-  **Responsive Design** - Mobile-first approach with dark mode support
-  **High Performance** - Optimized builds with Vite and Rolldown


## 📋 Requirements

- **PHP** 8.4+
- **Composer** 2.x
- **Node.js** 18+
- **npm** or **pnpm**
- **MySQL** 8+ or **PostgreSQL** 14+ or **SQLite** 3.8+

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/abdo-ab/pedf.git
cd pedf
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Configure Database

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pedf
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

Or use SQLite for development:

```env
DB_CONNECTION=sqlite
# DB_DATABASE will default to database/database.sqlite
```

### 5. Run Migrations

```bash
# Create SQLite database (if using SQLite)
touch database/database.sqlite

# Run migrations
php artisan migrate

# (Optional) Seed database with sample data
php artisan db:seed
```

### 6. Build Assets

```bash
# Development build with watch mode
npm run dev

# Or production build
npm run build
```

### 7. Generate Routes

```bash
# Generate TypeScript route helpers
php artisan wayfinder:generate
```

### 8. Start Development Server

```bash
# Start Laravel development server
php artisan serve

# In another terminal, start Vite dev server
npm run dev
```

Visit `http://localhost:8000` in your browser.

## 🧪 Testing

### Run All Tests

```bash
# Run PHP tests with Pest
php artisan test

# Run with coverage
php artisan test --coverage
```

### Run Specific Test Suites

```bash
# Run only feature tests
php artisan test --testsuite=Feature

# Run only unit tests
php artisan test --testsuite=Unit

# Run specific test file
php artisan test tests/Feature/DocumentUploadTest.php
```


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).


## 📧 Contact

**Abdo** - [@abdo-ab](https://github.com/abdo-ab)

**Project Link:** [https://github.com/abdo-ab/pedf](https://github.com/abdo-ab/pedf)

---

