# 🇵🇭 Tuklas — AI-Powered Career Intelligence

Tuklas is a Laravel and React career guidance platform for Filipino youth,
first-time jobseekers, and career shifters. It helps users explore career
paths, connect skills with TESDA-aligned opportunities, manage documents, and
scan credentials with AI assistance.

## Project layout

- `app/`, `routes/`, `database/`: Laravel API, authentication, models, and migrations
- `src/`: React pages, components, state, and client-side data
- `resources/`: Laravel's Vite entrypoint and Blade shell
- `public/`: static assets and the Laravel public entrypoint
- `docker/`, `Dockerfile`, `docker-compose.yml`: containerized local/deployment setup

## Requirements

- PHP 8.5+
- Composer
- Node.js 18+
- PostgreSQL 14+ (or Docker Desktop)
- Git

The commands below work on Windows, macOS, and Linux. Use PowerShell or
Command Prompt on Windows, and a terminal such as Terminal, iTerm2, or a
Linux shell on macOS/Linux.

## Local setup

1. Install the dependencies:

   ```bash
   composer install
   npm install
   ```

2. Create and configure the environment file:

   **Windows (PowerShell):**

   ```powershell
   Copy-Item .env.example .env
   php artisan key:generate
   ```

   **Windows (Command Prompt):**

   ```bash
   copy .env.example .env
   php artisan key:generate
   ```

   **macOS or Linux:**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Set the PostgreSQL connection values in `.env`. Keep `APP_KEY`, database
   passwords, OAuth credentials, and API keys out of source control.

   For a local PostgreSQL installation, set `DB_CONNECTION=pgsql` and the
   `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`
   values. The default local port is `5432`.

### PostgreSQL setup for local development

Start PostgreSQL before running Laravel migrations or opening the app. Laravel
connects to the database configured in `.env`; the default local connection is
`127.0.0.1:5432`.

#### Windows

1. Install PostgreSQL using the Windows installer from
   [postgresql.org/download/windows](https://www.postgresql.org/download/windows/).
   Include the command-line tools and remember the password you set for the
   `postgres` administrator account.
2. Make sure the PostgreSQL service is running. Open **Services** from the
   Start menu and start the service named `postgresql-x64-*` if needed. You can
   also use pgAdmin, which is installed with PostgreSQL.
3. Open PowerShell or Command Prompt and connect with `psql`:

   ```powershell
   psql -U postgres -h 127.0.0.1 -p 5432
   ```

   If `psql` is not found, open **SQL Shell (psql)** from the Start menu or add
   PostgreSQL's `bin` directory to `PATH`. Alternatively, open pgAdmin's Query
   Tool while connected to the local server.

#### macOS

With [Homebrew](https://brew.sh/), install and start PostgreSQL:

```bash
brew install postgresql
brew services start postgresql
psql postgres
```

If you installed PostgreSQL with its macOS installer instead, start the
PostgreSQL server from its menu-bar app or installer tools, then connect with
`psql -U postgres -h 127.0.0.1 -p 5432`.

#### Linux

On **Ubuntu / Debian**, install PostgreSQL and its PHP driver, then start the
service:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib php-pgsql
sudo systemctl enable --now postgresql
sudo -u postgres psql
```

On **Fedora / RHEL**, install PostgreSQL and the PHP driver, initialize the
database cluster once, then start the service:

```bash
sudo dnf install postgresql-server postgresql-contrib php-pgsql
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
sudo -u postgres psql
```

For other Linux distributions, install the PostgreSQL server and PHP's
`pdo_pgsql` extension using that distribution's package manager, start its
PostgreSQL service, and open a `psql` prompt as the PostgreSQL administrator.

#### Create the Tuklas database

At the PostgreSQL prompt, run the following SQL. Windows users should first
connect with `psql -U postgres -h 127.0.0.1 -p 5432`; macOS Homebrew users can
use `psql postgres`; Ubuntu/Debian and Fedora/RHEL users can use
`sudo -u postgres psql`. Replace the example password with a local development
password and do not commit it:

```sql
CREATE ROLE tuklas_app WITH LOGIN PASSWORD 'change-this-local-password';
CREATE DATABASE tuklas OWNER tuklas_app;
\q
```

If the role or database already exists, keep it and confirm it has the
permissions and password configured below instead of creating it again.

Set these values in the root `.env` file:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tuklas
DB_USERNAME=tuklas_app
DB_PASSWORD=change-this-local-password
```

Use the same `.env` values above on Windows, macOS, and Linux. For local
password authentication, use `127.0.0.1` as `DB_HOST`.

Check that Laravel has the PHP PostgreSQL driver and can reach the database:

```bash
php -m
php artisan config:clear
php artisan db:show
```

`php -m` should include `pdo_pgsql`. If it does not, enable/install the
PostgreSQL extension for the PHP version used by Laravel, then restart the
terminal or PHP server. After the database connection succeeds, create the
tables and local demo accounts:

```bash
php artisan migrate --seed
php artisan migrate:status
```

The `/api/db-health` endpoint should return `{"ok":true}` when the configured
database is reachable. If `pg_isready` reports “no response” or Laravel reports
“Connection refused”, start the PostgreSQL service and confirm its port matches
`DB_PORT`. If Laravel reports “could not find driver”, enable `pdo_pgsql`. If
it reports “password authentication failed” or “database does not exist”,
check the role, password, database name, and `.env` values. Run
`php artisan config:clear` after changing `.env`.

If you prefer not to install PostgreSQL directly, Docker is available on
Windows, macOS, and Linux. Run `docker compose up --build` to start the app and
PostgreSQL containers; migrations run automatically. The Compose app connects
to the service named `postgres`. Do not use `DB_HOST=127.0.0.1` for the app
container because that points back to the app container itself.

### API and OAuth configuration

All local API credentials are stored in the root `.env` file. Copy
`.env.example` to `.env` first; never place secret values in `src/` or commit
`.env`.

| Variable | Stored/used by | Visibility and purpose |
| --- | --- | --- |
| `GOOGLE_AI_API_KEY` | Laravel server, `app/Services/GeminiScannerService.php` | Server-only Gemini key used for document and career scanning. |
| `MAIL_HOST`, `MAIL_PORT` | Laravel server, `config/mail.php` | SMTP host and port used to send login and social-login OTP emails. |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Laravel server, `config/mail.php` | SMTP credentials for OTP email delivery. |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Laravel server, `config/mail.php` | Sender address and name for OTP email. |
| `VITE_GOOGLE_CLIENT_ID` | Vite client, `src/pages/Auth.jsx` | Public Google OAuth client ID. It is embedded in browser assets; it is not a secret. |
| `VITE_FACEBOOK_APP_ID` | Vite client, `src/pages/Auth.jsx` | Public Facebook OAuth app ID. It is embedded in browser assets; it is not a secret. |
| `VITE_FACEBOOK_GRAPH_API_VERSION` | Vite client, `src/pages/Auth.jsx` | Facebook Graph API version used by the login dialog; defaults to `v26.0`. |
| `VITE_AUTH_REDIRECT_URI` | Vite client, `src/pages/Auth.jsx` | OAuth callback URL, for example `http://127.0.0.1:8000/auth`. |
| `FACEBOOK_GRAPH_API_VERSION` | Laravel server, `config/services.php` | Facebook Graph API version used to verify access tokens; defaults to `v26.0`. |
| `GOOGLE_CLIENT_SECRET` | Laravel configuration, `config/services.php` | Server-side Google OAuth secret. Do not expose it through a `VITE_` variable. |
| `GOOGLE_REDIRECT_URI` | Laravel configuration, `config/services.php` | Server-side Google OAuth redirect configuration. |

The browser only receives variables prefixed with `VITE_` during the Vite
build. Server-only credentials are read by Laravel through `config/services.php`
and remain in PHP. For Google and Facebook sign-in, configure the exact
callback URL in the provider console and configure the `MAIL_*` SMTP settings;
social sign-in cannot complete OTP verification without working email settings.

3. Create the database schema:

   ```bash
   php artisan migrate
   ```

4. Start the frontend development server and Laravel application in separate
   terminals:

   ```bash
   npm run dev
   php artisan serve
   ```

   Open the URL printed by Laravel (normally `http://localhost:8000`). Vite
   provides hot module replacement for the React application.

### Docker

Docker Desktop is supported on Windows and macOS. Docker Engine is supported
on Linux. From the project directory, create `.env` and start the Laravel and
PostgreSQL containers:

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
docker compose up --build
```

**Windows (Command Prompt):**

```bash
copy .env.example .env
docker compose up --build
```

**macOS or Linux:**

```bash
cp .env.example .env
docker compose up --build
```

The application is available at `http://localhost:8000`.

To stop the containers, press `Ctrl+C` or run `docker compose down` in a
second terminal. If you use a locally installed PostgreSQL server instead of
Docker, run only the Laravel and Vite commands from the local setup section.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite in development mode |
| `npm run build` | Type-check and build frontend assets |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production Vite build |
| `php artisan migrate` | Apply database migrations |
| `php artisan route:list` | Inspect registered Laravel routes |

Before submitting changes, run `npm run lint`, `npm run build`, and the
relevant Laravel checks for the area you changed.

---

## 🧪 Pre-Configured Test Accounts (Quick Testing)

Use any of the following accounts to immediately test different user profiles and roles without registering:

| Account Name | Email | Password | Role / Profile Type |
| :--- | :--- | :--- | :--- |
| **Juan Dela Cruz** | `juan@tuklas.ph` | `password123` | Active Jobseeker (Pre-filled Profile & Skills) |
| **Maria Santos** | `maria@tuklas.ph` | `password123` | Career Shifter / Student Profile |
| **Test User** | `test@test.com` | `test1234` | General Test User |
| **Admin User** | `admin@tuklas.ph` | `admin123` | System Administrator (Full Admin Access) |

> 💡 **Tip:** On the **Sign In** screen (`/auth`), you can click any of the accounts in the **Test Accounts** box to auto-fill the credentials instantly.

---

## 🧭 Application Routes & Navigation

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Platform overview, features showcase, testimonials, and live demo preview. |
| `/auth` | **Auth (Sign In / Sign Up)** | Authentication with pre-configured accounts, social login mockups, and Pangasinan location cascading. |
| `/onboarding` | **Onboarding Flow** | 3-step guided career profile setup with skills and certification intake. |
| `/app` or `/dashboard` | **User Dashboard** | AI career roadmap, skill match score, job listings, and career insights. |
| `/admin` | **Admin Dashboard** | User directory, job management, analytics, and platform oversight. |
| `/scanner` | **AI Skill & Resume Scanner** | Credential and resume parsing with TESDA competency matching. |
| `/mobile` | **Mobile App Preview** | Interactive mobile viewport simulator of the Tuklas experience. |
| `/team` | **Team & About** | Development team and mission background. |
| `/privacy` | **Privacy Policy** | Data collection, processing, security, and user rights. |
| `/terms` | **Terms of Service** | Platform rules, responsibilities, and legal terms. |
| `/thank-you` | **Thank You** | Post-action confirmation screen. |
| `*` | **Not Found** | Fallback for unknown routes. |

## 📱 Mobile Support

The entire website is responsive from phone to desktop widths. Public pages use responsive navigation and stacked editorial layouts; authentication and onboarding forms reflow to a single column; the dashboard switches to mobile top and bottom navigation; scanner, admin, profile, career, and training views collapse into touch-friendly layouts with contained scrolling for wide data tables.

Test mobile behavior with browser device emulation at 320px, 375px, and 430px widths, including both light and dark themes. Verify that controls remain reachable, text does not overflow, dialogs fit the viewport, and tables scroll within their panels.

---

## 🔍 Key Features to Test

### 1. 🌓 Theme System (Dark Mode & Light Mode)
- **How to test:** Click the **Sun / Moon** icon on the navigation bar or top of the login panel.
- **What to verify:**
  - High-contrast typography and consistent background surfaces (`--bg-page`, `--bg-surface`, `--bg-card`).
  - Seamless input fields without browser autofill white box glitches.
  - Glowing mint and indigo accents in dark mode.

### 2. 🔐 Authentication & Location Selection
- **Sign In Testing:**
  - Click any **Test Account** to autofill and log in.
  - Test the **"Forgot Password?"** modal flow.
  - Test the **Google** or **Facebook** one-click social account chooser.
- **Sign Up Testing:**
  - Toggle to **Sign Up**.
  - Select a **Municipality / City** (e.g., *Lingayen*, *Dagupan*, *San Carlos*).
  - Notice the **Barangay dropdown dynamically cascades** with real Pangasinan barangay data.

### 3. 📊 AI Career Roadmap & Dashboard (`/app`)
- View personalized career suggestions and TESDA course alignments.
- Test skill match indicators, career goals, and resume download features.
- Explore notifications and user profile settings.

### 4. 🛠️ Admin Management (`/admin`)
- Log in with `admin@tuklas.ph` / `admin123`.
- Inspect platform metrics, user directory, and pathway management tools.

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR). |
| `npm run build` | Validates TypeScript (`tsc -b`) and bundles for production (`vite build`). |
| `npm run preview` | Runs local web server to preview production build. |
| `npm run lint` | Runs ESLint to inspect code quality. |

## ☁️ Railway Deployment

Deploy the repository to Railway with PostgreSQL. Railway runs Laravel through the included `railway.json`/`nixpacks.toml`; Vite builds the React assets during deployment and Laravel serves the SPA shell.

Configure these environment variables in Railway for production, or in `.env` for local development:

| Variable | Purpose |
| :--- | :--- |
| `DB_CONNECTION` | Set to `pgsql`. |
| `DATABASE_URL` or `DB_*` | Railway PostgreSQL connection values. |
| `APP_KEY` | Laravel application encryption key. |
| `AUTH_FIELD_SECRET` | Optional application authentication secret. |
| `GOOGLE_AI_API_KEY` | Server-only Google AI key for scanning. |
| `MAIL_MAILER` | Set to `smtp` for real OTP email delivery. |
| `MAIL_HOST`, `MAIL_PORT` | SMTP server connection values. |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP authentication credentials. |
| `MAIL_FROM_ADDRESS` | Verified sender address for authentication email. |
| `AUTH_OTP_REQUIRED` | Set to `true` to require OTP verification. |
| `VITE_GOOGLE_CLIENT_ID` | Public Google OAuth client ID. |
| `VITE_FACEBOOK_APP_ID` | Public Facebook OAuth app ID. |
| `VITE_FACEBOOK_GRAPH_API_VERSION` | Facebook Graph API version used by the browser login dialog. |
| `VITE_AUTH_REDIRECT_URI` | Production auth callback URL. |
| `FACEBOOK_GRAPH_API_VERSION` | Facebook Graph API version used for server-side access token verification. |

Do not commit `.env` or paste its contents into source control. Configure production secrets only in Railway environment variables.

---

## 🏗️ Technology Stack

- **Frontend Core:** React 19, TypeScript, Vite
- **Routing:** React Router DOM (v7)
- **Styling:** Design System Tokens (CSS Custom Properties), Responsive Dark/Light Modes
- **State & Context:** `ThemeContext` (Theme persistence), `UserContext` (Auth & profile state)
- **Backend API:** Laravel controllers and Eloquent API routes for authentication, users, documents, scans, folders, examples, and database health.
- **Data:** PostgreSQL through Eloquent plus the dynamic Pangasinan Philippine Standard Geographic Code (PSGC) API and local fallbacks

## 📁 Document Folders

Documents and scans are organized through the Laravel folder API and PostgreSQL relationships.

---

## 🤝 Contributing & Feedback

1. Branch off `main` for any new features or UI enhancements.
2. Ensure `npm run build` passes before submitting PRs.
3. Test dark and light mode contrast for accessibility standards.
