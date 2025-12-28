


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

## 🧠 Key Assumptions & Decisions

### **1. Universal Overlap Logic**
To prevent double-booking, I implemented a mathematical interval check:
`Conflict = (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)`
This ensures that even partial overlaps or back-to-back bookings are handled correctly.

### **2. Database-Driven Reminders**
I decided to store reminders as a separate table linked to events. This allows for:
* **Timezone Accuracy**: All times are stored in UTC.
* **Scalability**: The system is prepared for a Cron job to poll these entries and trigger notifications.

### **3. AI as a Technical Partner**
I utilized AI throughout the development lifecycle to:
* **Optimize Formulae**: Refining the conflict detection logic for performance.
* **Debug Deployment**: Identifying a specific JSON syntax error at position 266 in `package.json` that was halting the Vercel build.

---

## ⚠️ Known Limitations & Future Roadmap

### **Current Limitations**
* **Single Calendar**: Users are currently limited to one primary calendar.
* **Internal Notifications**: Reminders exist in the database but do not yet trigger external emails (SMTP integration pending).

### **Future Improvements**
1.  **Google Calendar Sync**: OAuth integration to import external events.
2.  **Drag-and-Drop Interface**: For intuitive rescheduling on the dashboard.
3.  **Collaborative Calendars**: Allowing multiple users to view and edit a shared team calendar.

---

## 📝 Experience Report: Working on this Project
Working on this system was an insightful journey into **Next.js 15's** new paradigms. The most challenging aspect was synchronizing the local environment with the production server. 

**Key Learning Moments:**
* **Environment Security**: Resolving "Internal Server Errors" by correctly configuring `JWT_SECRET` and `DATABASE_URL` within the Vercel dashboard.
* **CI/CD Pipeline**: Learning how a single trailing comma in a configuration file can disrupt a production deployment, and using build logs to solve it efficiently.




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
Create a .env file in the root directory and add your credentials:

DATABASE_URL="postgresql://neondb_owner:npg_oxVrbhG3z5FU@ep-soft-river-ahek0pkp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
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

