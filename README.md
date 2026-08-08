# DocChase

**Stop chasing clients for documents.**

DocChase helps CA firms, accountants, consultants, loan agents, insurance agents, and HR consultants collect required documents from clients without repeatedly chasing them on WhatsApp.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- MongoDB + Mongoose
- Auth.js (NextAuth) credentials
- Cloudinary (file storage)
- Nodemailer (SMTP email)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in:

- `MONGODB_URI` — MongoDB Atlas connection string
- `AUTH_SECRET` — `openssl rand -base64 32`
- Cloudinary keys
- SMTP vars (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) for Nodemailer (optional locally; emails are skipped if missing)
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core flows

1. Register → workspace created with starter templates
2. Add a client
3. Create a document request → secure public link
4. Client uploads at `/request/[token]` (no login)
5. Professional reviews, approves/rejects, sends reminders

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run typecheck` — TypeScript check

## Deploy

Deploy on Vercel. Set the same environment variables in the project settings.
