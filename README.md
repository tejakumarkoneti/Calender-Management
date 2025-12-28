


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


### **API Route Documentation**
| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | User registration and account creation. |
| `/api/auth/login` | `POST` | Secure login and JWT generation. |
| `/api/events` | `GET/POST` | Fetching the calendar feed and creating new events with conflict checks. |
| `/api/events/[id]` | `PUT/DELETE` | Updating specific event details or removing them from the schedule. |



⚙️ Installation & Setup
1. Environment Variables
To get started, create a .env file in your root directory. This file stores your sensitive credentials. You will need to add your specific database connection string and a secret key for authentication:

DATABASE_URL: Use your Neon PostgreSQL connection string (e.g., postgresql://user:password@endpoint/neondb?sslmode=require).

JWT_SECRET: Define a secure, random string to be used as your JWT secret key.

2. Database Initialization
Once your environment variables are set, you need to prepare the database. Follow these steps in your terminal:

Run npm install to download all necessary project dependencies.

Execute npx prisma migrate dev --name init to push your database schema to your PostgreSQL instance and initialize the tracking history.

🏃 Running the Application
To operate the full system, you must have two separate terminals running simultaneously:

Terminal 1 (Web App): Run npm run dev. This starts the Next.js development server, allowing you to access the UI and API at http://localhost:3000.

Terminal 2 (Reminder Worker): Run npm run reminders. This activates the background process that monitors the database for upcoming notifications.

🔔 How Reminders Work
The reminder system follows a four-step automated lifecycle:

Creation: When you create an event, the system calculates a remindAt timestamp based on your settings and saves it directly to the Database.

Worker: A background script located in jobs/reminderWorker.ts stays active and "wakes up" every minute using a utility called node-cron.

Polling: The worker queries PostgreSQL to find any unsent reminders where the remindAt time is now or in the past.

Trigger: Once a reminder is identified, it logs the notification to the terminal. The system then marks that reminder as sent: true so it is not triggered again.

🧠 Key Features & Decisions
1. Robust Conflict Detection
To prevent the common headache of double-booking, I implemented a hasConflict utility using interval algebra. An event is flagged as a conflict if the new event starts before an existing one ends, and it ends after an existing one starts. This covers all scenarios, including partial overlaps and back-to-back meetings.

2. Timezone-Aware Reminders
To ensure the calendar works globally, the system converts all user-input times to UTC before saving. When you set a reminder for "10 minutes before," the calculation happens in UTC, ensuring your notification is accurate no matter what timezone you are in.

3. AI-Assisted Debugging
AI was utilized as a technical partner throughout the build to:

Refactor and verify the mathematical logic for event overlaps.

Identify a specific "position 266" syntax error in the package.json file that blocked the Vercel deployment.

Help transition the local worker logic into a structure ready for cloud-based Cron Jobs.

⚠️ Known Limitations
1. Currently, the system has a few constraints intended for future updates:

2. Single Calendar: Users are limited to one primary calendar per account.

3. Internal Alerts: Reminders currently function as database entries and terminal logs; they do not yet send external emails or SMS.


🗺️ Future Roadmap
I plan to expand the system with the following features:

1. Google Calendar Sync: Integrating OAuth to allow users to import and export external schedules.

2. Drag-and-Drop UI: Adding an interactive grid dashboard for easier rescheduling.

3. Shared Calendars: Enabling collaboration features so teams or families can view shared schedules.

4. External Notifications: Connecting the database to providers like Resend or SendGrid for real-time email alerts.