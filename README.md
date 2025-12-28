


# 📅 Full-Stack Calendar & Event Management System

A modern, production-ready event management application built with **Next.js 15**. This project features a dynamic calendar interface, secure JWT authentication, a PostgreSQL database managed via Prisma ORM, and an automated background reminder system.

## 🚀 Key Features

* **Secure Authentication:**
    * JWT-based Login and Registration.
    * Password hashing with bcrypt and secure token storage in `localStorage`.
    * User-specific data isolation (privacy-focused).
* **Interactive Calendar Dashboard:**
    * Full monthly view of events.
    * **Quick Creation:** Double-click any date to open the `CreateEventForm`.
    * **Edit & Update:** Single-click an event to modify titles or details.
* **Automated Reminder System:**
    * Set reminders for 5, 10, or 30 minutes before an event.
    * **Background Worker:** A standalone Node-cron worker that monitors the database and triggers notifications.
* **Modular Architecture:** Organized into reusable components and clean logic helpers.

---

## 🛠️ Tech Stack

### Frontend & Backend
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **ORM:** Prisma
* **Database:** PostgreSQL

### Infrastructure & Tools
* **Task Scheduling:** `node-cron`
* **Script Execution:** `tsx` (for modern ESM-compatible execution)
* **Environment Management:** `dotenv`

---


⚙️ Installation & Setup
1️⃣ Environment Variables

Create a .env file in the root directory:

DATABASE_URL=postgresql://user:password@endpoint/neondb?sslmode=require
JWT_SECRET=your_secure_random_string

2️⃣ Database Initialization

npm install
npx prisma migrate dev --name init
This initializes the PostgreSQL schema and Prisma migration history.


🏃 Running the Application

Run two terminals simultaneously:
Terminal 1 – Web Application

npm run dev
Access at: http://localhost:3000

Terminal 2 – Reminder Worker

npm run reminders
Runs the background cron process.

🔔 How the Reminder System Works
Creation: When an event is created, the system calculates remindAt based on user preference and stores it in UTC.

Worker Execution: A Node-cron worker runs every minute.

Polling: The worker fetches reminders where:

remindAt <= currentTime
sent = false
Trigger & Update:
The reminder is logged and marked as sent = true to prevent duplicate triggers.


🧠 Key Design Decisions
1️⃣ Robust Conflict Detection

Implemented using interval overlap logic:
An event conflicts if newStart < existingEnd AND newEnd > existingStart

This covers:
Partial overlaps
Fully contained events
Adjacent time slots

2️⃣ Timezone-Safe Scheduling

All event times are converted to UTC before saving
Reminder calculations are also done in UTC
Ensures consistent behavior across timezones



⚠️ Current Limitations

Single calendar per user
Reminders are internal (terminal logs only)
No email or SMS notifications yet

🗺️ Future Enhancements

Google Calendar Sync (OAuth)
Drag-and-drop event rescheduling
Shared calendars for teams/families
Email notifications via Resend or SendGrid
Cloud-based cron jobs for production

## 📂 Project Structure

The project is organized following the Next.js App Router conventions:

```text
├── app/
│   ├── api/
│   │   ├── auth/            # Login & Register API routes
│   │   └── events/          # Event CRUD & [id] routes
│   ├── dashboard/           # Main Calendar UI Page
│   ├── signup/              # Signup Page
│   ├── layout.tsx           # Global Layout
│   └── page.tsx             # Landing/Home Page
├── components/              # Reusable UI Logic
│   ├── CreateEventForm.tsx
│   ├── EventList.tsx
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── jobs/
│   └── reminderWorker.ts    # Background cron job for reminders
├── lib/                     # Utility & Helper functions
│   ├── api.ts               # Frontend API wrapper
│   ├── auth.ts              # Auth helpers
│   ├── jwt.ts               # JWT sign/verify logic
│   └── prisma.ts            # Shared Prisma client
├── prisma/
│   └── schema.prisma        # Database schema (User, Event, Reminder)
├── .env                     # Environment variables (DATABASE_URL, JWT_SECRET)
└── next.config.ts           # Next.js configuration


### **API Route Documentation**
| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | User registration and account creation. |
| `/api/auth/login` | `POST` | Secure login and JWT generation. |
| `/api/events` | `GET/POST` | Fetching the calendar feed and creating new events with conflict checks. |
| `/api/events/[id]` | `PUT/DELETE` | Updating specific event details or removing them from the schedule. |

