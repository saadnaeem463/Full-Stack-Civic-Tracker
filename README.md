# CivicTrack

**A civic issue-reporting and tracking platform that connects citizens who notice everyday problems with the city teams who fix them — openly, transparently, and in public view.**

[Live Demo](https://full-stack-civic-tracker.vercel.app/) · [Report an Issue](#) · [Admin Portal](#)

---

## The Problem

Most civic complaints disappear into a void. A resident notices a pothole, a broken streetlight, or an overflowing dumpster — but there's no good way to report it, no visibility into whether anyone saw it, and no way to know if or when it'll actually get fixed. Meanwhile, the city staff responsible for these issues often work from scattered phone calls, paper logs, or disconnected spreadsheets, with no map of where problems are clustering, no record of what's already been assigned, and no clear picture of what budget is going where.

**CivicTrack closes that loop.** It gives citizens a simple way to report what they see, gives city staff a real operations console to triage and resolve it, and gives both sides a shared, public timeline so no report just disappears.

---

## Who It's For

| Role | What they can do |
|---|---|
| **Citizen** | Browse the live issue map, report a new problem with a photo and location, upvote and comment on existing reports, track their own submissions, and get notified as status changes |
| **Moderator** | Triage incoming reports, update status, add internal notes, assign field workers, flag suspicious reports, request budget increases |
| **Admin** | Everything a moderator can do, plus manage the worker roster, allocate and review the municipal budget, approve/reject budget requests, view city-wide analytics, and manage platform settings |

No account is required to browse the map and read reports — signing in is only needed to contribute (report, comment, upvote).

---

## Core Features

### For citizens
- **Live issue map** — every report plotted geographically, updating in real time as new ones come in (no refresh needed)
- **Report an issue** — submit with a photo, location, category (Roads / Lighting / Cleanliness / Parks), and description
- **Public status timeline** — every report moves through `Reported → Acknowledged → In Progress → Resolved`, visible to everyone, so nothing disappears silently
- **Upvoting & comments** — surface the issues that matter most to the community and add context to existing reports
- **My Reports** — track the status of everything you've personally submitted
- **Notifications** — get notified when your report is acknowledged, commented on, or resolved

### For moderators & admins
- **Admin operations console** — a dedicated dashboard for triaging the full report queue, with an at-a-glance count of unacknowledged reports
- **Report management** — update status, add internal (staff-only) notes, flag reports as suspicious, assign a field worker, or delete invalid reports
- **Worker roster** — maintain a directory of field workers by specialty (Roads crew, Electrical, Sanitation, Parks), track who's busy vs. free, and see jobs completed per worker
- **Budget management**
  - Set and track a total municipal budget pool
  - Allocate funds across issue categories
  - Log expenses against specific reports and categories
  - Submit, review, approve, or reject budget increase requests — with notes and a full audit trail
- **Analytics dashboard** — city-wide view of report volume, resolution times, and category breakdowns
- **Audit log** — every status change, note, worker assignment, and budget decision is logged with who did it and when
- **Real-time everything** — new reports, comments, upvotes, status changes, and budget requests all push live to every connected client via WebSockets — no polling

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (hosted on MongoDB Atlas) |
| **Real-time** | [Pusher](https://pusher.com/) — public channels for the live map/report feed, private per-user channels for notifications |
| **UI components** | [shadcn/ui](https://ui.shadcn.com/) on Tailwind CSS |
| **Auth** | Custom email/password auth with role-based access control (`citizen` / `moderator` / `admin`), JWT-based sessions |
| **File storage** | Vercel Blob (report photos, avatars) |
| **Email** | [Resend](https://resend.com/) (verification emails) |
| **Hosting** | [Vercel](https://vercel.com/) |

---

## Architecture Notes

- **Role-based auth is baked into the JWT** — every protected API route and admin page checks the decoded token's role rather than re-querying the database on every request.
- **Real-time updates run on Pusher**, split into two kinds of channels:
  - *Public* channels (`reports-channel`, `comment-added`, `upvote-channel`, `budget-channel`) broadcast openly — anyone viewing the map or admin console gets instant updates.
  - *Private per-user* channels (`private-user-{id}`) deliver personal notifications and require the Pusher auth endpoint to subscribe.
- **The budget module is category-based**, not tied 1:1 to individual reports — a total pool is allocated across four issue categories, and both expenses and increase requests are tracked per category, independent of any single report.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB instance)
- A [Pusher](https://pusher.com/) app (free tier works)
- A [Resend](https://resend.com/) API key (for verification emails)
- A Vercel Blob store (for file uploads)

### Environment Variables

Create a `.env` file in the project root:

```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-signing-secret
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Pusher — server-side trigger uses all four; client-side subscribe only needs key + cluster
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
```

### Install & Run

```bash
npm install
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## Try It Yourself

The live demo is seeded with sample data — reports, workers, budget activity, and all. Log in with any of these to explore each role:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@civictrack.app` | `Password123` |
| **Moderator** | `moderator1@civictrack.app` | `Password123` |
| **Citizen** | `ayesha.khan0@example.com` | `Password123` |

> These are demo accounts on seeded data only — don't reuse this password for anything real.

---

## Project Structure

```
app/
├── (shared-layout)/
│   ├── page.tsx              # Public issue map (home)
│   ├── how-it-works/         # Landing/explainer page
│   ├── profile/              # User profile & "my reports"
│   └── admin/
│       ├── dashboard/        # Admin ops console
│       ├── reports/          # Report triage & management
│       ├── workers/          # Worker roster
│       ├── budget/           # Budget allocation, expenses, requests
│       ├── analytics/        # City-wide analytics
│       └── settings/         # Platform settings
├── auth/                     # Sign up, login, email verification
└── api/                      # REST API routes for all of the above

models/                        # Mongoose schemas (User, Report, Workers,
                                # Budget, CategoryBudget, Expense, BudgetRequest,
                                # Notification, AuditLog)
components/web/                # UI components (map, report forms, admin panels)
lib/                           # DB connection, Pusher setup, auth helpers
```

---

## License

This project is open for educational and portfolio purposes.
