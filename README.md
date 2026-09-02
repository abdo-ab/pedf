# PEDF - PDF Editor

[![Build Status](https://github.com/abdo-ab/pedf/actions/workflows/tests.yml/badge.svg)](https://github.com/abdo-ab/pedf/actions/workflows/tests.yml)
[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-3.0-9553E9)](https://inertiajs.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Edit PDFs. Keep the original design.**

A modern, full-stack PDF editing application built with Laravel 13, React 19, and Inertia.js 3. PEDF allows users to edit text-based PDF documents while preserving the original design and layout.

## ✨ Features

- 🔐 **Complete Authentication System** - Login, registration, email verification, password reset, and 2FA
- 📄 **PDF Upload & Validation** - Smart detection of text-based vs scanned PDFs
- 🎨 **Visual PDF Editor** - Edit text, add images, signatures, and annotations
- 💾 **Non-Destructive Editing** - Preserve original PDF design and formatting
- 📊 **User Dashboard** - Manage documents, view usage, and track edits
- 🎯 **Real-time Rendering** - PDF.js-powered document rendering
- 🔒 **Secure Storage** - Private document storage with UUID-based access
- 🎨 **Modern UI/UX** - Built with Tailwind CSS 4 and shadcn/ui components
- 📱 **Responsive Design** - Mobile-first approach with dark mode support
- ⚡ **High Performance** - Optimized builds with Vite and Rolldown

## 🛠️ Tech Stack

### Backend
- **Laravel 13** - PHP framework
- **Laravel Fortify** - Authentication backend
- **Laravel Wayfinder** - TypeScript route generation
- **Pest PHP** - Testing framework
- **PHPStan** - Static analysis
- **Laravel Pint** - Code formatting

### Frontend
- **React 19** - UI library with React Compiler
- **Inertia.js 3** - Modern monolith architecture
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library (Radix UI)
- **Lucide React** - Icon library
- **PDF.js** - PDF rendering engine
- **pdf-lib** - PDF manipulation

### Development Tools
- **Vite 8** - Build tool
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Laravel Boost** - Development productivity tools

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

### Code Quality Checks

```bash
# Run all CI checks
composer run ci:check

# Individual checks
npm run lint:check      # ESLint
npm run format:check    # Prettier
npm run types:check     # TypeScript
composer run lint:check # PHP Pint
composer run types:check # PHPStan
```

### Fix Code Style Issues

```bash
# Fix JavaScript/TypeScript
npm run lint
npm run format

# Fix PHP
composer run lint
```

## 📁 Project Structure

```
pedf/
├── app/
│   ├── Http/
│   │   ├── Controllers/          # HTTP controllers
│   │   ├── Requests/             # Form requests
│   │   └── Resources/            # API resources
│   ├── Models/                   # Eloquent models
│   └── Services/                 # Business logic services
├── database/
│   ├── factories/                # Model factories
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Database seeders
├── resources/
│   ├── css/                      # Global styles
│   ├── js/
│   │   ├── actions/              # Wayfinder actions (generated)
│   │   ├── components/           # React components
│   │   ├── hooks/                # React hooks
│   │   ├── layouts/              # Page layouts
│   │   ├── lib/                  # Utility libraries
│   │   ├── pages/                # Inertia pages
│   │   ├── routes/               # Wayfinder routes (generated)
│   │   └── types/                # TypeScript types
│   └── views/                    # Blade templates
├── routes/
│   ├── api.php                   # API routes
│   ├── web.php                   # Web routes
│   └── settings.php              # Settings routes
└── tests/
    ├── Feature/                  # Feature tests
    └── Unit/                     # Unit tests
```

## 🔧 Configuration

### Fortify Configuration

Authentication features are configured in `config/fortify.php`:

- Email verification
- Password reset
- Two-factor authentication
- Profile management

### SEO Configuration

SEO metadata is managed via `artesaos/seotools` in `config/seotools.php`.

### Inertia Configuration

Client-side routing settings in `config/inertia.php`.

## 🎨 Customization

### Adding New Routes

1. Define routes in `routes/web.php` or `routes/api.php`
2. Generate TypeScript helpers:
   ```bash
   php artisan wayfinder:generate
   ```
3. Use in React components:
   ```tsx
   import { dashboard } from '@/routes';
   
   <Link href={dashboard.url()}>Dashboard</Link>
   ```

### Creating Components

Components follow the shadcn/ui pattern:

```tsx
// resources/js/components/ui/my-component.tsx
export function MyComponent() {
  return <div>Hello World</div>;
}
```

### Styling

The project uses Tailwind CSS 4:

```tsx
<div className="flex items-center gap-4 rounded-xl bg-muted p-4">
  <span className="text-sm font-semibold">Styled component</span>
</div>
```

## 📝 Development Workflow

### Conventional Commits

This project follows conventional commit standards:

```
feat: add PDF export functionality
fix: resolve upload validation error
chore: update dependencies
docs: improve README installation steps
style: format code with Prettier
refactor: extract PDF processing to service
test: add document editor tests
ci: update GitHub Actions workflow
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Push and create PR
5. Wait for CI checks
6. Request review

## 🚢 Deployment

### Production Build

```bash
# Build for production
npm run build

# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Variables

Ensure these are set in production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Generate a secure key
APP_KEY=base64:...
```

### Laravel Cloud

This application can be deployed using [Laravel Cloud](https://cloud.laravel.com/) for optimal performance and scalability.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow PSR-12 for PHP
- Use TypeScript for all new JavaScript code
- Write tests for new features
- Maintain test coverage above 80%
- Document complex logic

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP framework
- [React](https://reactjs.org) - The UI library
- [Inertia.js](https://inertiajs.com) - The modern monolith
- [Tailwind CSS](https://tailwindcss.com) - The CSS framework
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Lucide](https://lucide.dev) - Icon library

## 📧 Contact

**Abdo** - [@abdo-ab](https://github.com/abdo-ab)

**Project Link:** [https://github.com/abdo-ab/pedf](https://github.com/abdo-ab/pedf)

---

<p align="center">Made with ❤️ using Laravel, React, and Inertia.js</p>
