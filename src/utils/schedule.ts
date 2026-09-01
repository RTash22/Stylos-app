/**
 * Schedule calculation utilities.
 *
 * Pure functions for computing positions, detecting overlaps,
 * and building time slot grids.
 */
import { PX_PER_MINUTE, SCHEDULE_SLOT_MINUTES } from '@/constants';
import type { Appointment, WorkingHours, TimeBlock } from '@/types';
import {
  getMinutesFromMidnight,
  doRangesOverlap,
  parseISO,
  differenceInMinutes,
  addMinutes,
  setTimeOnDate,
} from '@/utils/dates';

export interface ScheduleBlock {
  id: string;
  type: 'appointment' | 'available' | 'break' | 'blocked';
  topPx: number;
  heightPx: number;
  startMinutes: number;
  durationMinutes: number;
  appointment?: Appointment;
  label?: string;
}

/**
 * Calculate the top offset (px) and height (px) for a time range
 * relative to a reference hour (e.g., 9:00 = work start).
 */
export function getBlockPosition(
  startIso: string,
  endIso: string,
  dayStartHour: number,
): { topPx: number; heightPx: number; startMinutes: number; durationMinutes: number } {
  const startDate = parseISO(startIso);
  const endDate = parseISO(endIso);
  const startMinutes = getMinutesFromMidnight(startDate);
  const durationMinutes = differenceInMinutes(endDate, startDate);
  const dayStartMinutes = dayStartHour * 60;
  const topPx = (startMinutes - dayStartMinutes) * PX_PER_MINUTE;
  const heightPx = Math.max(durationMinutes * PX_PER_MINUTE, 30); // min 30px

  return { topPx, heightPx, startMinutes, durationMinutes };
}

/**
 * Detect if a proposed appointment overlaps with any existing
 * confirmed/pending appointments or blocks.
 */
export function detectOverlap(
  proposedStart: Date,
  proposedEnd: Date,
  existingAppointments: Appointment[],
  timeBlocks: TimeBlock[],
  excludeId?: string,
): boolean {
  const occupied = existingAppointments
    .filter(
      (a) =>
        a.id !== excludeId &&
        ['pendiente', 'confirmada', 'reprogramacion_propuesta'].includes(a.status),
    )
    .some((a) =>
      doRangesOverlap(proposedStart, proposedEnd, parseISO(a.starts_at), parseISO(a.ends_at)),
    );

  if (occupied) return true;

  return timeBlocks.some((b) =>
    doRangesOverlap(proposedStart, proposedEnd, parseISO(b.starts_at), parseISO(b.ends_at)),
  );
}

/**
 * Build the full list of schedule blocks for one day.
 */
export function buildDayBlocks(
  date: Date,
  workingHours: WorkingHours | undefined,
  appointments: Appointment[],
  timeBlocks: TimeBlock[],
  dayStartHour: number,
  dayEndHour: number,
): ScheduleBlock[] {
  if (!workingHours || !workingHours.is_active) {
    return [];
  }

  const blocks: ScheduleBlock[] = [];

  // Add appointment blocks
  for (const apt of appointments) {
    const pos = getBlockPosition(apt.starts_at, apt.ends_at, dayStartHour);
    blocks.push({
      id: apt.id,
      type: 'appointment',
      ...pos,
      appointment: apt,
    });
  }

  // Add time block (manual blocks)
  for (const tb of timeBlocks) {
    const pos = getBlockPosition(tb.starts_at, tb.ends_at, dayStartHour);
    blocks.push({
      id: tb.id,
      type: 'blocked',
      ...pos,
      label: tb.reason || 'Bloqueado',
    });
  }

  // Add break block
  if (workingHours.break_start && workingHours.break_end) {
    const breakStartDate = setTimeOnDate(
      date,
      parseInt(workingHours.break_start.split(':')[0]),
      parseInt(workingHours.break_start.split(':')[1]),
    );
    const breakEndDate = setTimeOnDate(
      date,
      parseInt(workingHours.break_end.split(':')[0]),
      parseInt(workingHours.break_end.split(':')[1]),
    );
    const startMinutes = getMinutesFromMidnight(breakStartDate);
    const durationMinutes = differenceInMinutes(breakEndDate, breakStartDate);
    const dayStartMinutes = dayStartHour * 60;
    blocks.push({
      id: `break-${workingHours.id}`,
      type: 'break',
      topPx: (startMinutes - dayStartMinutes) * PX_PER_MINUTE,
      heightPx: durationMinutes * PX_PER_MINUTE,
      startMinutes,
      durationMinutes,
      label: 'Descanso',
    });
  }

  // Find available slots by filling gaps
  const occupiedRanges = blocks
    .map((b) => ({
      start: b.startMinutes,
      end: b.startMinutes + b.durationMinutes,
    }))
    .sort((a, b) => a.start - b.start);

  const whStartMinutes =
    parseInt(workingHours.start_time.split(':')[0]) * 60 +
    parseInt(workingHours.start_time.split(':')[1]);
  const whEndMinutes =
    parseInt(workingHours.end_time.split(':')[0]) * 60 +
    parseInt(workingHours.end_time.split(':')[1]);

  let cursor = whStartMinutes;
  for (const range of occupiedRanges) {
    if (range.start > cursor) {
      const gapDuration = range.start - cursor;
      if (gapDuration >= SCHEDULE_SLOT_MINUTES) {
        const dayStartMinutes = dayStartHour * 60;
        blocks.push({
          id: `available-${cursor}`,
          type: 'available',
          topPx: (cursor - dayStartMinutes) * PX_PER_MINUTE,
          heightPx: gapDuration * PX_PER_MINUTE,
          startMinutes: cursor,
          durationMinutes: gapDuration,
          label: '+ Disponible',
        });
      }
    }
    cursor = Math.max(cursor, range.end);
  }

  // Fill remaining time after last block
  if (cursor < whEndMinutes) {
    const gapDuration = whEndMinutes - cursor;
    if (gapDuration >= SCHEDULE_SLOT_MINUTES) {
      const dayStartMinutes = dayStartHour * 60;
      blocks.push({
        id: `available-${cursor}`,
        type: 'available',
        topPx: (cursor - dayStartMinutes) * PX_PER_MINUTE,
        heightPx: gapDuration * PX_PER_MINUTE,
        startMinutes: cursor,
        durationMinutes: gapDuration,
        label: '+ Disponible',
      });
    }
  }

  return blocks.sort((a, b) => a.startMinutes - b.startMinutes);
}

/**
 * Generate the hour labels for the time axis.
 */
export function generateHourLabels(startHour: number, endHour: number): string[] {
  const labels: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    labels.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return labels;
}
