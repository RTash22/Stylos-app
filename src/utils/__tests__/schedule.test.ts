/**
 * Tests for utils/schedule.ts
 *
 * Tests overlap detection, block positioning, hour labels,
 * and day block generation.
 */

// Mock the constants module
jest.mock('@/constants', () => ({
  PX_PER_MINUTE: 1.5,
  SCHEDULE_SLOT_MINUTES: 30,
}));

// Mock the date utils
jest.mock('@/utils/dates', () => ({
  parseISO: (s: string) => new Date(s),
  differenceInMinutes: (end: Date, start: Date) =>
    Math.round((end.getTime() - start.getTime()) / 60000),
  addMinutes: (date: Date, mins: number) => new Date(date.getTime() + mins * 60000),
  getMinutesFromMidnight: (date: Date) => date.getHours() * 60 + date.getMinutes(),
  doRangesOverlap: (aS: Date, aE: Date, bS: Date, bE: Date) =>
    aS < bE && aE > bS,
  setTimeOnDate: (_date: Date, hours: number, minutes: number) => {
    const d = new Date(2025, 0, 1, hours, minutes);
    return d;
  },
}));

import { getBlockPosition, detectOverlap, buildDayBlocks, generateHourLabels } from '../schedule';
import type { Appointment, WorkingHours, TimeBlock } from '@/types';

describe('getBlockPosition', () => {
  // Use local date constructors to avoid UTC conversion issues in the mock
  it('should calculate position for a 9:00-10:00 block (day start = 9)', () => {
    const start = new Date(2025, 0, 15, 9, 0, 0);
    const end = new Date(2025, 0, 15, 10, 0, 0);
    const result = getBlockPosition(
      start.toISOString(),
      end.toISOString(),
      9,
    );

    expect(result.startMinutes).toBe(9 * 60); // 540
    expect(result.durationMinutes).toBe(60);
    expect(result.topPx).toBe(0); // starts at day start
    expect(result.heightPx).toBe(60 * 1.5); // 90px
  });

  it('should calculate offset for a 10:30 block (day start = 9)', () => {
    const start = new Date(2025, 0, 15, 10, 30, 0);
    const end = new Date(2025, 0, 15, 11, 0, 0);
    const result = getBlockPosition(
      start.toISOString(),
      end.toISOString(),
      9,
    );

    expect(result.startMinutes).toBe(10 * 60 + 30); // 630
    expect(result.topPx).toBe((630 - 540) * 1.5); // 135px offset
    expect(result.durationMinutes).toBe(30);
  });

  it('should enforce minimum 30px height', () => {
    const start = new Date(2025, 0, 15, 10, 0, 0);
    const end = new Date(2025, 0, 15, 10, 10, 0);
    const result = getBlockPosition(
      start.toISOString(),
      end.toISOString(),
      9,
    );

    // 10 minutes * 1.5 = 15px, but min is 30px
    expect(result.heightPx).toBe(30);
  });
});

describe('detectOverlap', () => {
  const baseAppointment: Appointment = {
    id: 'apt-1',
    client_id: 'c-1',
    barber_id: 'b-1',
    service_id: 's-1',
    start_time: '2025-01-15T09:00:00.000Z',
    end_time: '2025-01-15T10:00:00.000Z',
    status: 'confirmada',
    history_notes: null, customer_notes: null,
    proposed_start_time: null,
    proposed_end_time: null,
    cancellation_reason: null,
    created_at: '2025-01-15T00:00:00.000Z',
    updated_at: '2025-01-15T00:00:00.000Z',
  };

  it('should detect overlap with existing appointment', () => {
    const result = detectOverlap(
      new Date('2025-01-15T09:30:00.000Z'),
      new Date('2025-01-15T10:30:00.000Z'),
      [baseAppointment],
      [],
    );

    expect(result).toBe(true);
  });

  it('should NOT detect overlap when times are adjacent', () => {
    const result = detectOverlap(
      new Date('2025-01-15T10:00:00.000Z'),
      new Date('2025-01-15T11:00:00.000Z'),
      [baseAppointment],
      [],
    );

    expect(result).toBe(false);
  });

  it('should detect overlap with time blocks', () => {
    const block: TimeBlock = {
      id: 'tb-1',
      barber_id: 'b-1',
      start_time: '2025-01-15T14:00:00.000Z',
      end_time: '2025-01-15T15:00:00.000Z',
      reason: 'Lunch',
      created_at: '2025-01-15T00:00:00.000Z',
    };

    const result = detectOverlap(
      new Date('2025-01-15T14:30:00.000Z'),
      new Date('2025-01-15T15:30:00.000Z'),
      [],
      [block],
    );

    expect(result).toBe(true);
  });

  it('should exclude specified appointment from overlap check', () => {
    const result = detectOverlap(
      new Date('2025-01-15T09:00:00.000Z'),
      new Date('2025-01-15T10:00:00.000Z'),
      [baseAppointment],
      [],
      'apt-1', // exclude this one
    );

    expect(result).toBe(false);
  });

  it('should ignore cancelled/rejected appointments', () => {
    const cancelledApt: Appointment = {
      ...baseAppointment,
      id: 'apt-2',
      status: 'cancelada',
    };

    const result = detectOverlap(
      new Date('2025-01-15T09:00:00.000Z'),
      new Date('2025-01-15T10:00:00.000Z'),
      [cancelledApt],
      [],
    );

    expect(result).toBe(false);
  });

  it('should check pendiente appointments for overlap', () => {
    const pendingApt: Appointment = {
      ...baseAppointment,
      id: 'apt-3',
      status: 'pendiente',
    };

    const result = detectOverlap(
      new Date('2025-01-15T09:30:00.000Z'),
      new Date('2025-01-15T10:30:00.000Z'),
      [pendingApt],
      [],
    );

    expect(result).toBe(true);
  });
});

describe('generateHourLabels', () => {
  it('should generate labels from start to end hour', () => {
    const labels = generateHourLabels(9, 20);
    expect(labels).toHaveLength(12);
    expect(labels[0]).toBe('09:00');
    expect(labels[labels.length - 1]).toBe('20:00');
  });

  it('should pad single-digit hours', () => {
    const labels = generateHourLabels(8, 10);
    expect(labels[0]).toBe('08:00');
    expect(labels[1]).toBe('09:00');
    expect(labels[2]).toBe('10:00');
  });

  it('should handle single hour range', () => {
    const labels = generateHourLabels(14, 14);
    expect(labels).toEqual(['14:00']);
  });
});

describe('buildDayBlocks', () => {
  const date = new Date(2025, 0, 15); // Wednesday

  const workingHours: WorkingHours = {
    id: 'wh-1',
    barber_id: 'b-1',
    day_of_week: 3,
    start_time: '09:00',
    end_time: '20:00',
    
    
    is_active: true,
  };

  it('should return empty for inactive working hours', () => {
    const inactive: WorkingHours = { ...workingHours, is_active: false };
    const blocks = buildDayBlocks(date, inactive, [], [], 9, 20);
    expect(blocks).toEqual([]);
  });

  it('should return empty for undefined working hours', () => {
    const blocks = buildDayBlocks(date, undefined, [], [], 9, 20);
    expect(blocks).toEqual([]);
  });

  it('should include break block', () => {
    const blocks = buildDayBlocks(date, workingHours, [], [], 9, 20);
    const breakBlock = blocks.find(b => b.type === 'break');
    expect(breakBlock).toBeDefined();
    expect(breakBlock!.label).toBe('Descanso');
  });

  it('should include available slots', () => {
    const blocks = buildDayBlocks(date, workingHours, [], [], 9, 20);
    const availableBlocks = blocks.filter(b => b.type === 'available');
    expect(availableBlocks.length).toBeGreaterThan(0);
  });

  it('should sort blocks by start time', () => {
    const blocks = buildDayBlocks(date, workingHours, [], [], 9, 20);

    for (let i = 1; i < blocks.length; i++) {
      expect(blocks[i].startMinutes).toBeGreaterThanOrEqual(blocks[i - 1].startMinutes);
    }
  });

  it('should include appointment blocks', () => {
    const apt: Appointment = {
      id: 'apt-1',
      client_id: 'c-1',
      barber_id: 'b-1',
      service_id: 's-1',
      start_time: '2025-01-15T10:00:00.000Z',
      end_time: '2025-01-15T11:00:00.000Z',
      status: 'confirmada',
      history_notes: null, customer_notes: null,
      proposed_start_time: null,
      proposed_end_time: null,
      cancellation_reason: null,
      created_at: '2025-01-15T00:00:00.000Z',
      updated_at: '2025-01-15T00:00:00.000Z',
    };

    const blocks = buildDayBlocks(date, workingHours, [apt], [], 9, 20);
    const aptBlock = blocks.find(b => b.type === 'appointment');
    expect(aptBlock).toBeDefined();
    expect(aptBlock!.appointment).toBe(apt);
  });

  it('should include manual time blocks', () => {
    const tb: TimeBlock = {
      id: 'tb-1',
      barber_id: 'b-1',
      start_time: '2025-01-15T16:00:00.000Z',
      end_time: '2025-01-15T17:00:00.000Z',
      reason: 'Personal',
      created_at: '2025-01-15T00:00:00.000Z',
    };

    const blocks = buildDayBlocks(date, workingHours, [], [tb], 9, 20);
    const blocked = blocks.find(b => b.type === 'blocked');
    expect(blocked).toBeDefined();
    expect(blocked!.label).toBe('Personal');
  });
});
