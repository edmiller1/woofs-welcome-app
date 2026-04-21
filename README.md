# 🐾 Woofs Welcome

> Discover dog-friendly places across New Zealand — cafés, parks, restaurants, accommodation, and more.

Woofs Welcome is a full-stack dog-friendly venue discovery platform connecting dog owners with businesses that welcome their four-legged companions. Built as a two-sided marketplace, it lets users find and review dog-friendly spots while giving businesses a channel to reach pet-owning customers.

---

## ✨ Features

- 🗺️ **Explore** — Browse dog-friendly places on an interactive map or list view, filtered by location and category
- ⭐ **Reviews** — Leave ratings and reviews for places you've visited with your dog
- ❤️ **Favourites** — Save and organise your favourite spots
- 👤 **Profiles** — Customisable user profiles with privacy settings
- 🔐 **Auth** — Email OTP and Google OAuth via Better Auth (multi-session capable)
- 📸 **Images** — Photo uploads for reviews and places via Cloudflare Images + R2
- 📧 **Emails** — Transactional emails (OTP, welcome) via Resend

---

## 🏗️ Architecture

This is a **Turborepo monorepo** with three apps and shared packages:

```
woofs-welcome-app/
├── apps/
│   ├── api/          # Hono REST API (Cloudflare Worker)
│   ├── web/          # SvelteKit frontend (Cloudflare Pages)
│   └── images/       # Cloudflare Worker for image transformation & serving
└── packages/
    ├── api/          # Shared API client
    ├── types/        # Shared TypeScript types
    └── image-config/ # Shared image variant config
```

---

## 🛠️ Tech Stack

### Backend (`apps/api`)
| Tool | Purpose |
|------|---------|
| [Hono](https://hono.dev) | Lightweight web framework for Cloudflare Workers |
| [Bun](https://bun.sh) | Runtime & package manager |
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe SQL ORM |
| [Neon PostgreSQL](https://neon.tech) | Serverless Postgres (HTTP + WebSocket drivers) |
| [Better Auth](https://better-auth.com) | Authentication (Email OTP + Google OAuth) |
| [Zod](https://zod.dev) | Schema validation |
| [Resend](https://resend.com) | Transactional email |
| [Sentry](https://sentry.io) | Error tracking |
| [Upstash Redis](https://upstash.com) | Rate limiting |

### Frontend (`apps/web`)
| Tool | Purpose |
|------|---------|
| [SvelteKit](https://kit.svelte.dev) | Full-stack web framework |
| [Svelte 5](https://svelte.dev) | UI with runes-based reactivity |
| [TanStack Query](https://tanstack.com/query) | Server state management |
| [shadcn-svelte](https://shadcn-svelte.com) | Accessible UI components |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [MapLibre GL JS](https://maplibre.org) | Open-source interactive maps |

### Infrastructure
| Service | Purpose |
|---------|---------|
| [Cloudflare Workers](https://workers.cloudflare.com) | API & image worker hosting |
| [Cloudflare Pages](https://pages.cloudflare.com) | Web app hosting |
| [Cloudflare Images](https://developers.cloudflare.com/images) | User-generated image storage & delivery |
| [Cloudflare R2](https://developers.cloudflare.com/r2) | Object storage |
| [Cloudflare Queues](https://developers.cloudflare.com/queues) | Background job processing (ad impressions) |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.2`
- [Node.js](https://nodejs.org) `>= 20` (for some tooling)
- [pnpm](https://pnpm.io) `>= 10`
- A [Neon](https://neon.tech) database
- A [Cloudflare](https://cloudflare.com) account
- A [Resend](https://resend.com) account

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/woofs-welcome-app.git
cd woofs-welcome-app

# Install dependencies
pnpm install
```

### Environment Variables

Copy the example env file in `apps/api` and fill in your values:

```bash
cp apps/api/.env.example apps/api/.env
```

Key variables you'll need:

```env
DATABASE_URL=            # Neon connection string
BETTER_AUTH_SECRET=      # Random secret for auth
GOOGLE_CLIENT_ID=        # Google OAuth client ID
GOOGLE_CLIENT_SECRET=    # Google OAuth client secret
GOOGLE_REDIRECT_URI=     # OAuth redirect URI
FRONTEND_BASE_URL=       # e.g. http://localhost:5173
MOBILE_BASE_URL=         # Mobile app URL
RESEND_API_KEY=          # Resend API key
```

### Development

```bash
# Run all apps concurrently
pnpm dev

# Or run individually
pnpm --filter api dev
pnpm --filter web dev
```

### Database

```bash
# Generate migrations
cd apps/api
bun drizzle-kit generate

# Apply migrations
bun drizzle-kit migrate
```

---

## 📁 Project Structure (API)

The API follows a **service/repository pattern** with clean separation of concerns:

```
src/
├── config/       # Environment validation
├── db/           # Drizzle schema & database client
├── emails/       # React Email templates
├── lib/          # Auth, error classes, storage clients
├── middleware/   # Auth guard, rate limiting
├── routes/       # Thin Hono route handlers
└── services/     # Business logic layer
```

---

## 🗺️ Roadmap

- [x] Authentication (Email OTP + Google OAuth)
- [x] User profiles & privacy settings
- [x] Reviews & ratings
- [x] Favourites
- [x] Image uploads
- [ ] MapLibre explore page (in progress)
- [ ] Place data seeding (Auckland, Wellington, Christchurch)
- [ ] Business claiming & advertiser dashboard
- [ ] React Native mobile app
- [ ] Australia expansion

---

## 📄 License

Private — all rights reserved.

---

<p align="center">Built with ☕ and 🐕 in New Zealand</p>
