/**
 * Date and timezone utilities.
 *
 * All dates in the database are stored as timestamptz (UTC).
 * We display them in America/Monterrey.
 */
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  addMinutes,
  differenceInMinutes,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
  getDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { TZDate } from '@date-fns/tz';
import { TIMEZONE } from '@/constants';

/** Parse an ISO string and return a TZDate in our timezone */
export function toLocalDate(iso: string): TZDate {
  return new TZDate(parseISO(iso), TIMEZONE);
}

/** Get "now" in the app's timezone */
export function nowLocal(): TZDate {
  return new TZDate(new Date(), TIMEZONE);
}

/** Format a date for display */
export function formatDate(date: Date | TZDate, fmt: string): string {
  return format(date, fmt, { locale: es });
}

/** Format time as HH:mm */
export function formatTime(date: Date | TZDate): string {
  return format(date, 'HH:mm', { locale: es });
}

/** Format a friendly date like "Lun 15 Sep" */
export function formatShortDate(date: Date | TZDate): string {
  return format(date, 'EEE d MMM', { locale: es });
}

/** Format full date like "Lunes, 15 de septiembre" */
export function formatFullDate(date: Date | TZDate): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: es });
}

/** Get the start of the week (Monday) */
export function getWeekStart(date: Date | TZDate): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/** Get the end of the week (Sunday) */
export function getWeekEnd(date: Date | TZDate): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/** Create a TZDate from hours and minutes on a given date */
export function setTimeOnDate(date: Date | TZDate, hours: number, minutes: number): TZDate {
  const d = new TZDate(date, TIMEZONE);
  return new TZDate(setMinutes(setHours(d, hours), minutes), TIMEZONE);
}

/** Get minutes offset from a reference time (for schedule positioning) */
export function getMinutesFromMidnight(date: Date | TZDate): number {
  const d = new TZDate(date, TIMEZONE);
  return d.getHours() * 60 + d.getMinutes();
}

/** Check if two time ranges overlap */
export function doRangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return isBefore(aStart, bEnd) && isAfter(aEnd, bStart);
}

/** Get the day-of-week index (1=Mon … 6=Sat, 0=Dom) */
export function getDayIndex(date: Date | TZDate): number {
  return getDay(date);
}

// Re-export commonly used date-fns functions
export {
  parseISO,
  addDays,
  addMinutes,
  differenceInMinutes,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
};
