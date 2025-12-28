import * as dotenv from "dotenv";
import path from "path";
import cron from "node-cron";

// 1. Load the environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runWorker() {
  // 2. Dynamically import the prisma instance AFTER dotenv has loaded
  const { prisma } = await import("../lib/prisma");

  console.log("🚀 Reminder worker started (cron: * * * * *)");

  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      console.log(`[${now.toISOString()}] Checking for reminders...`);

      const reminders = await prisma.reminder.findMany({
        where: {
          sent: false,
          remindAt: { lte: now },
        },
        include: {
          event: {
            include: {
              calendar: {
                include: { owner: true },
              },
            },
          },
        },
      });

      if (!reminders.length) return;

      for (const reminder of reminders) {
        try {
          const userEmail = reminder.event.calendar?.owner?.email ?? "(unknown)";
          console.log(`✅ TRIGGERED: ${reminder.event.title} for ${userEmail}`);

          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent: true },
          });
        } catch (err) {
          console.error("Error updating reminder:", err);
        }
      }
    } catch (err) {
      console.error("Reminder worker query error:", err);
    }
  });
}

// Start the worker
runWorker().catch((err) => console.error("Worker startup failed:", err));