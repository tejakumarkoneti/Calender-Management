import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { toUTC } from "@/lib/time";
import { hasConflict } from "@/services/event.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = requireAuth(req));
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, startTime, endTime, reminderMinutes } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { calendars: true }
  });

  const calendar = user!.calendars[0];

  const startUTC = toUTC(startTime, user!.timezone);
  const endUTC = toUTC(endTime, user!.timezone);

  if (await hasConflict(calendar.id, startUTC, endUTC)) {
    return NextResponse.json({ error: "Time conflict" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      startUTC,
      endUTC,
      calendarId: calendar.id
    }
  });

  // If a reminder is requested, create a Reminder record
  if (typeof reminderMinutes === 'number' && reminderMinutes > 0) {
    const remindAt = new Date(startUTC);
    remindAt.setMinutes(remindAt.getMinutes() - reminderMinutes);

    try {
      await prisma.reminder.create({
        data: {
          eventId: event.id,
          remindAt
        }
      });
    } catch (err) {
      // Non-fatal: log and continue
      console.error('CREATE_REMINDER_ERROR', err);
    }
  }

  return NextResponse.json(event);
}

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = requireAuth(req));
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const start = new Date(searchParams.get("start")!);
  const end = new Date(searchParams.get("end")!);

  const calendar = await prisma.calendar.findFirst({
    where: { ownerId: userId }
  });

  const events = await prisma.event.findMany({
    where: {
      calendarId: calendar!.id,
      startUTC: { gte: start },
      endUTC: { lte: end }
    }
  });

  return NextResponse.json(events);
}
