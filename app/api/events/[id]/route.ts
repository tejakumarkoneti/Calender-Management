import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { toUTC } from "@/lib/time";
import { hasConflict } from "@/services/event.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * Define the context type for Next.js 15 dynamic routes
 * params must be treated as a Promise.
 */
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Helper to handle the update logic for both PUT and PATCH
async function updateEvent(req: NextRequest, { params }: RouteContext) {
  let userId: string;
  try {
    const auth = requireAuth(req);
    userId = auth.userId;
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // FIX: Unwrapping params before use
    const { id } = await params;
    const body = await req.json();
    const { title, startTime, endTime, reminderMinutes } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const event = await prisma.event.findUnique({ 
      where: { id: id }, 
      include: { calendar: true } 
    });

    if (!user || !event) {
      return NextResponse.json({ error: !user ? "Unauthorized" : "Event not found" }, { status: !user ? 401 : 404 });
    }

    if (event.calendar.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = { title };
    let finalStartUTC = event.startUTC;

    // Only recalculate UTC if times are provided
    if (startTime && endTime) {
      const startUTC = toUTC(startTime, user.timezone);
      const endUTC = toUTC(endTime, user.timezone);
      
      if (await hasConflict(event.calendarId, startUTC, endUTC, event.id)) {
        return NextResponse.json({ error: "Time conflict" }, { status: 400 });
      }
      
      updateData.startUTC = startUTC;
      updateData.endUTC = endUTC;
      finalStartUTC = startUTC;
    }

    const updated = await prisma.event.update({
      where: { id: id },
      data: updateData
    });

    // --- REMINDER LOGIC ---
    const existingReminder = await prisma.reminder.findFirst({ where: { eventId: updated.id } });

    if (typeof reminderMinutes === 'number' && reminderMinutes > 0) {
      const remindAt = new Date(new Date(finalStartUTC).getTime() - reminderMinutes * 60000);

      if (existingReminder) {
        await prisma.reminder.update({ 
          where: { id: existingReminder.id }, 
          data: { remindAt, sent: remindAt <= new Date() } 
        });
      } else {
        await prisma.reminder.create({ 
          data: { eventId: updated.id, remindAt, sent: remindAt <= new Date() } 
        });
      }
    } else if (existingReminder && (reminderMinutes === 0 || reminderMinutes === null)) {
      await prisma.reminder.delete({ where: { id: existingReminder.id } });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('UPDATE_EVENT_ERROR', err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return updateEvent(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return updateEvent(req, context);
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = requireAuth(req);
    const userId = auth.userId;

    // FIX: Unwrapping params before use
    const { id } = await params;

    const event = await prisma.event.findUnique({ 
      where: { id: id }, 
      include: { calendar: true } 
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.calendar.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /**
     * Permanent deletion. 
     * Assumes 'onDelete: Cascade' has been added to schema.prisma 
     * and migration has been run.
     */
    await prisma.event.delete({ 
      where: { id: id } 
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE_EVENT_ERROR', err);
    return NextResponse.json({ error: "Delete failed", details: err.message }, { status: 500 });
  }
}