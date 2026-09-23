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
- PostgreSQL (or Docker)

## Local setup

1. Install the dependencies:

   ```bash
   composer install
   npm install
   ```

2. Create and configure the environment file:

   ```bash
   copy .env.example .env       # Windows
   # cp .env.example .env       # macOS/Linux
   php artisan key:generate
   ```

   Set the PostgreSQL connection values in `.env`. Keep secrets such as API
   keys out of source control.

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
| `VITE_AUTH_REDIRECT_URI` | Vite client, `src/pages/Auth.jsx` | OAuth callback URL, for example `http://127.0.0.1:8000/auth`. |
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

For a local Laravel and PostgreSQL environment:

```bash
copy .env.example .env       # Windows
docker compose up --build
```

The application is available at `http://localhost:8000`.

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
| `VITE_AUTH_REDIRECT_URI` | Production auth callback URL. |

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
