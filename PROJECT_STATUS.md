# Foundry — Project Status & Feature Overview

## What is Foundry?

Foundry is a community platform for entrepreneurs to post startup problems, receive structured solutions from experienced builders and mentors, and build a shared knowledge base. Built with Next.js 16, MongoDB, Prisma ORM, and NextAuth.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.3 (App Router, Turbopack) |
| Language | TypeScript |
| Database | MongoDB (via Prisma ORM 5.22) |
| Auth | NextAuth v4 (JWT strategy, Credentials provider) |
| Styling | Tailwind CSS v4 |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel |
| Testing | Playwright |

---

## User Roles

| Role | Description |
|---|---|
| `EXPLORER` | New user, just getting started |
| `BUILDER` | Active startup founder |
| `MENTOR` | Approved expert who provides solutions |
| `ADMIN` | Platform administrator (env-based credentials) |

---

## Features Completed

### Authentication
- [x] User registration with 2-step flow (details → role selection)
- [x] Login with email and password
- [x] JWT-based session management (30-day expiry)
- [x] Role-based redirect after login (Admin → `/admin`, Users → `/dashboard`)
- [x] Password reset via email (token-based, SMTP)
- [x] Change password from settings
- [x] Sign out

### Admin
- [x] Separate admin credentials via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- [x] Admin-only layout (no sidebar, dedicated header with sign out)
- [x] Admin restricted to `/admin` routes only — blocked from all other pages
- [x] Non-admin users blocked from accessing `/admin`
- [x] Admin sidebar option only visible to admin role
- [x] Review mentor applications (Approve / Reject / Need Info)
- [x] View applicant details (expertise, experience, background, proof of work)

### Dashboard
- [x] Welcome message with user's name
- [x] Stats cards: Problems Posted, Solutions Received, Reputation Points, Account Status
- [x] Weekly change indicators on stats
- [x] Recent problems list (last 2 problems)
- [x] Quick actions: Post Problem, Browse Knowledge Base, Find Mentors, Apply as Mentor
- [x] Recent activity feed (solutions received, problems posted, upvotes)
- [x] Conditional "Apply to become a Mentor" button (hidden if already applied or is mentor)

### Problem Management
- [x] 4-step problem posting wizard (Title → Description → Category → Stage)
- [x] Step progress indicator
- [x] 8 problem categories: Product Development, Marketing, Fundraising, Operations, Hiring, Legal, Technology, Strategy
- [x] 5 startup stages: Idea, MVP, Early Stage, Growth, Scaling
- [x] Community problems listing page with solution count and upvotes
- [x] Individual problem detail page with full description, tags, author info
- [x] Problem status (Open / Solved)

### Solutions
- [x] Submit solutions to problems via modal form
- [x] Solution content (free text)
- [x] Action steps (dynamic add/remove)
- [x] Recommended tools (dynamic add/remove)
- [x] Upvote / downvote solutions
- [x] Vote toggle (click again to remove vote)
- [x] Solution author info with role badge and reputation
- [x] Verified solution badge

### Knowledge Base
- [x] Browse all community problems and solutions
- [x] Search by title or description
- [x] Filter by category
- [x] Filter by startup stage
- [x] Toggle filter panel
- [x] Premium upgrade banner for free users
- [x] Problem solved/open status badges

### Mentors
- [x] Mentor directory listing
- [x] Search by name, title, or bio
- [x] Filter by expertise area
- [x] Stats: total mentors, total solutions, average rating
- [x] Mentor cards with expertise badges, rating, response time, reputation
- [x] Verified and Premium mentor badges

### Mentor Application
- [x] Apply to become a mentor form (Full Name, Expertise, Experience, Background, Proof of Work)
- [x] Check for existing application before showing form
- [x] View application status (Pending / Approved / Rejected / Needs Info)
- [x] View admin review notes
- [x] Button hidden on dashboard/profile if already applied or already a mentor

### Profile
- [x] Display user name, email, role badge, level badge, reputation
- [x] Member since date
- [x] Stats: Problems Posted, Solutions Provided, Upvotes Received, Verified Solutions
- [x] Recent problems list with solution count and solved status
- [x] Apply to become a Mentor button (conditional)
- [x] Mentor application status display

### Settings
- [x] Update profile name and email
- [x] Notification preferences (New Solutions, Mentor Responses, Weekly Digest)
- [x] Change password via email reset link
- [x] 2FA placeholder (UI present, functionality not implemented)
- [x] Subscription plan display with upgrade button
- [x] Sign out

### Upgrade / Pricing
- [x] 3-tier pricing: Free ($0), Premium ($29/mo), Pro ($99/mo)
- [x] Feature comparison per plan
- [x] "Most Popular" badge on Premium
- [x] Upgrade handler (API connected, no payment gateway)
- [x] Testimonials section
- [x] FAQ section

### Landing Page
- [x] Hero section with CTA buttons
- [x] How it Works section (3 steps)
- [x] Built for entrepreneurs section
- [x] Pricing preview (Free vs Premium)
- [x] Footer

### How It Works Page
- [x] 4-step visual guide (Post → Get Solutions → Verify → Build Reputation)
- [x] CTA to register or browse problems

### Navigation & Layout
- [x] Public navigation bar (landing page)
- [x] Authenticated sidebar with all main routes
- [x] Dark/light theme toggle
- [x] Admin-only sidebar item (Shield icon, role-gated)
- [x] Responsive layout (mobile + desktop)
- [x] Smooth animations (fade-in, slide-in, scale-in, stagger)

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/register` | POST | User registration |
| `/api/user` | GET | Fetch current user profile |
| `/api/dashboard` | GET | Dashboard stats |
| `/api/activity` | GET | Recent activity feed |
| `/api/problems` | GET/POST | List / create problems |
| `/api/problems/[id]` | GET | Single problem with solutions |
| `/api/solutions` | POST | Submit a solution |
| `/api/votes` | POST | Upvote / downvote solution |
| `/api/mentors` | GET | List approved mentors |
| `/api/mentor-application` | GET/POST | Apply / check mentor application |
| `/api/admin/mentor-applications` | GET/PUT | Admin: list and review applications |
| `/api/settings` | PUT | Update user settings |
| `/api/change-password` | POST | Send password reset email |
| `/api/reset-password` | POST | Reset password with token |
| `/api/stats` | GET | Platform statistics |
| `/api/upgrade` | POST | Upgrade subscription plan |

### Database Models (MongoDB via Prisma)

| Model | Purpose |
|---|---|
| `User` | Core user with role, reputation, premium status |
| `Account` | OAuth account linking (NextAuth) |
| `Session` | Session management (NextAuth) |
| `Problem` | Startup problems posted by users |
| `Solution` | Solutions submitted to problems |
| `Vote` | Upvote/downvote on solutions |
| `Comment` | Comments on problems and solutions |
| `MentorApplication` | Mentor applications with review status |
| `Subscription` | User subscription plan tracking |
| `PasswordResetToken` | Secure password reset tokens |

---

## Features Not Yet Implemented

| Feature | Status |
|---|---|
| Payment gateway (Stripe) | UI exists, no real payment processing | done
| Two-Factor Authentication (2FA) | UI placeholder only | done
| Mentor direct messaging ("Ask Question" button) | Button exists, no functionality | done
| Mentor profile view ("View Profile" button) | Button exists, no page | done
| Comment system | Model exists in DB, no UI | done
| Problem solved marking | Status in DB, no UI toggle | done
| Email notifications | SMTP configured, not triggered on events | done
| Weekly digest emails | Toggle in settings, not implemented | done
| Advanced analytics for premium users | Mentioned in pricing, not built |
| 1-on-1 mentor sessions | Listed in Pro plan, not built | done
| Premium content locking | Partial UI (lock icon commented out) |
| OAuth providers (Google, GitHub) | Not configured |
| Image upload for profiles | No file upload |
| Search across entire platform | Per-page only | done

---

## Deployment

- **Platform:** Vercel
- **Live URL:** `https://foundry-neon.vercel.app`
- **Build Command:** `npm run build`
- **Prisma Generate:** Runs automatically via `postinstall` script

### Required Environment Variables (Vercel Dashboard)

```
DATABASE_URL=
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## Known Issues

| Issue | Details |
|---|---|
| Middleware deprecation warning | Next.js 16 deprecates `middleware.ts` in favor of `proxy` — cosmetic warning only, no functional impact |
| `isPremium` not in session | Knowledge base premium lock is disabled (`isPremium` hardcoded to `false`) |
| Admin credentials in env | Admin is not a DB user — credentials are checked directly against env variables |
| No real payment processing | Upgrade API marks user as premium in DB but no Stripe integration |

---

## Project Structure

```
/app
  /admin          → Admin panel (mentor application review)
  /api            → All API routes
  /dashboard      → User dashboard
  /knowledge-base → Searchable problem/solution feed
  /login          → Login page
  /mentors        → Mentor directory
  /post-problem   → 4-step problem posting wizard
  /problems       → Community problems list + detail
  /profile        → User profile and stats
  /register       → 2-step registration
  /reset-password → Password reset
  /settings       → Account settings
  /upgrade        → Pricing and upgrade page
  /how-it-works   → Platform guide
  page.tsx        → Public landing page

/components
  /ui             → Badge, Button, Card, Input, Select, Textarea
  auth-provider   → NextAuth session provider
  navigation      → Public nav bar
  sidebar         → Authenticated sidebar
  theme-provider  → Dark/light theme

/lib
  auth.ts         → NextAuth configuration
  email.ts        → Nodemailer email utility
  prisma.ts       → Prisma client singleton

/prisma
  schema.prisma   → Full database schema

/types
  next-auth.d.ts  → Extended session types
```
