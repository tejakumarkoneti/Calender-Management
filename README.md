


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



## 🧠 Key Features & Decisions

### 1. Robust Conflict Detection
One of the core challenges was ensuring that no two events overlap. I implemented a `hasConflict` utility that uses interval algebra. An event is flagged as a conflict if:
- `(NewEventStart < ExistingEventEnd)` **AND** `(NewEventEnd > ExistingEventStart)`
This formula handles partial overlaps, complete enclosures, and identical time slots.

### 2. Timezone-Aware Reminders
The system converts all user-input times to **UTC** before saving them to the database. When a user sets a reminder (e.g., "10 minutes before"), the system calculates the exact UTC timestamp for notification, ensuring accuracy regardless of the user's local timezone.

### 3. AI-Assisted Debugging
During development, AI acted as a technical thought partner. It helped:
- Refactor the mathematical logic for event overlaps.
- Diagnose a specific `package.json` syntax error at position 266 during the Vercel build process.
- Transition a local background worker into a cloud-ready Vercel Cron Job architecture.

---

## ⚠️ Known Limitations
While the core functionality is production-ready, there are certain limitations in this current version:
* **One Calendar Per User:** Currently, the system supports a single primary calendar for each registered user.
* **Internal Reminders Only:** Reminders are successfully generated as database entries, but the system does not yet send external notifications (Email/SMS/Push).

---

## 🗺️ Future Roadmap
1.  **Google Calendar Sync:** Integrate OAuth and the Google Calendar API to allow users to sync external schedules.
2.  **Drag-and-Drop UI:** Implement a more interactive dashboard where users can reschedule events by dragging them across a grid.
3.  **Shared Calendars:** Enable collaboration features, allowing users to share specific calendars with teammates or family members.
4.  **External Notification Service:** Connect the `Reminder` table to an email provider (like Resend or SendGrid) to trigger real-time alerts.

---

## ⚙️ Setup & Installation

1. **Install Dependencies:**
   ```bash
   npm install



