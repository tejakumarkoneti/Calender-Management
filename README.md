


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

⚙️ Installation & Setup
1. Environment Variables
Create a .env file in the root directory and add your credentials:
  DATABASE_URL="postgresql://neondb_owner:npg_P8qRxHYZiIo2@ep-flat-band-adxtm1sp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  JWT_SECRET="your_jwt_secret_key"

2. Database Initialization
Install dependencies and push the schema to your PostgreSQL instance:
  npm install
  npx prisma migrate dev --name init

🏃 Running the Application
You must run two separate terminals for the full system to function:

Terminal 1: Web App
Starts the Next.js development server for the UI and API.
npm run dev
Access at: http://localhost:3000

Terminal 2: Reminder Worker
Starts the background process that checks for reminders every minute.
npm run reminders

🔔 How Reminders Work
Creation: When an event is created, a remindAt timestamp is calculated and saved in the Database.

Worker: The script in jobs/reminderWorker.ts wakes up every minute using node-cron.

Polling: It queries PostgreSQL for any unsent reminders where remindAt is less than or equal to the current time.

Trigger: It logs the notification to the terminal and marks the reminder as sent: true so it does not trigger again.



