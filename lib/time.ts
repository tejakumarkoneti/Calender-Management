import { DateTime } from "luxon";

export function toUTC(time: string, timezone: string) {
  return DateTime.fromISO(time, { zone: timezone }).toUTC().toJSDate();
}

// Also provide a default export to help some bundlers resolve the module reliably
export default toUTC;

