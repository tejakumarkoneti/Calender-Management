import { prisma } from "@/lib/prisma";

export async function hasConflict(
  calendarId: string,
  startUTC: Date,
  endUTC: Date,
  ignoreId?: string
) {
  const conflict = await prisma.event.findFirst({
    where: {
      calendarId,
      startUTC: { lt: endUTC },
      endUTC: { gt: startUTC },
      NOT: ignoreId ? { id: ignoreId } : undefined
    }
  });

  return !!conflict;
}
