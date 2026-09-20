# Tuklas Laravel migration

The React application remains the source of truth for UI, routing, copy, theme tokens, responsive behavior, and interactions. Laravel now owns the HTTP/API boundary, session authentication, validation, authorization, persistence, and deployment runtime.

## Mapping inventory

| Existing feature | Existing boundary | Laravel target | Status |
| --- | --- | --- | --- |
| React pages and CSS | `src/pages`, `src/index.css` | `resources/js` entrypoint + Vite | Preserved |
| `/`, `/auth`, `/onboarding`, `/app`, `/dashboard`, `/admin`, `/scanner`, `/mobile`, `/team`, `/privacy`, `/terms`, `/thank-you` | React Router | Laravel catch-all view + React Router | Preserved |
| Login, signup, social session, logout | Legacy Node/Mongo boundary | `AuthController` + Laravel session guard | Migrated |
| Users and admin CRUD | Legacy Node/Mongo boundary | `UserController`, `User` | Migrated |
| Scans and analysis persistence | Legacy Node/Mongo boundary | `ScanController`, `Scan` | Migrated |
| Documents/folders | Legacy Node/Mongo boundary | Eloquent models/controllers | Migrated |
| Gemini scanner | React scanner requests | `GeminiScannerService`, `ScanController` | Migrated |
| MongoDB | Legacy backend | PostgreSQL + Eloquent | Removed |
| Google/Facebook/Resend | environment/API integrations | Laravel services/config | Credentials intentionally not committed |

## Local development

1. Install PHP 8.5, Composer, PostgreSQL, and Node.js.
2. `composer install` and `npm install`.
3. Copy `.env.example` to `.env`, set PostgreSQL values, then run `php artisan key:generate` and `php artisan migrate`.
4. Run `npm run dev` and serve Laravel through Herd, or use `php artisan serve` in a second terminal.

For local Docker development, copy `.env.example` to `.env`, set `APP_KEY`, then run `docker compose up --build`. The included compose file starts Laravel and PostgreSQL together on `http://localhost:8000`.

For Railway, connect a PostgreSQL service and set the Laravel variables from `.env.example` (`APP_KEY`, `APP_URL`, `APP_DEBUG=false`, `DB_*` or Railway's `DATABASE_URL`, plus the API/OAuth values you use). Railway uses the included `Dockerfile`; it builds the React/Vite assets, installs PHP dependencies, enables `pdo_pgsql`, serves Laravel through Apache, runs migrations, and warms the Laravel caches at startup. Set `RUN_MIGRATIONS=true` for the first deployment and keep `migrate:fresh` out of production.

## Verification boundary

The migration scaffolding and source-level route/model mappings are complete. Laravel bootstrap, route caching, Composer dependency resolution, and the Vite production build pass locally. Run the PostgreSQL migration and seeded-account checks after configuring `pdo_pgsql` and the local PostgreSQL database.
