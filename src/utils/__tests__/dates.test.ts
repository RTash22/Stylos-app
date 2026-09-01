/**
 * Tests for utils/dates.ts
 *
 * Tests the pure date utility functions.
 * TZDate tests are basic since the actual timezone conversion
 * depends on the system locale in the test environment.
 */

// Mock @date-fns/tz for Node environment
jest.mock('@date-fns/tz', () => ({
  TZDate: class TZDate extends Date {
    constructor(date: Date | string | number, _tz?: string) {
      super(typeof date === 'string' ? date : date instanceof Date ? date.getTime() : date);
    }
  },
}));

jest.mock('@/constants', () => ({
  TIMEZONE: 'America/Monterrey',
}));

import { doRangesOverlap, getMinutesFromMidnight, getDayIndex } from '../dates';

describe('doRangesOverlap', () => {
  it('should detect overlapping ranges', () => {
    const a1 = new Date('2025-01-15T09:00:00Z');
    const a2 = new Date('2025-01-15T10:00:00Z');
    const b1 = new Date('2025-01-15T09:30:00Z');
    const b2 = new Date('2025-01-15T10:30:00Z');

    expect(doRangesOverlap(a1, a2, b1, b2)).toBe(true);
  });

  it('should NOT detect overlap for adjacent ranges', () => {
    const a1 = new Date('2025-01-15T09:00:00Z');
    const a2 = new Date('2025-01-15T10:00:00Z');
    const b1 = new Date('2025-01-15T10:00:00Z');
    const b2 = new Date('2025-01-15T11:00:00Z');

    expect(doRangesOverlap(a1, a2, b1, b2)).toBe(false);
  });

  it('should detect when one range completely contains the other', () => {
    const a1 = new Date('2025-01-15T08:00:00Z');
    const a2 = new Date('2025-01-15T12:00:00Z');
    const b1 = new Date('2025-01-15T09:00:00Z');
    const b2 = new Date('2025-01-15T10:00:00Z');

    expect(doRangesOverlap(a1, a2, b1, b2)).toBe(true);
  });

  it('should NOT detect overlap for non-overlapping ranges', () => {
    const a1 = new Date('2025-01-15T09:00:00Z');
    const a2 = new Date('2025-01-15T10:00:00Z');
    const b1 = new Date('2025-01-15T14:00:00Z');
    const b2 = new Date('2025-01-15T15:00:00Z');

    expect(doRangesOverlap(a1, a2, b1, b2)).toBe(false);
  });

  it('should be symmetric', () => {
    const a1 = new Date('2025-01-15T09:00:00Z');
    const a2 = new Date('2025-01-15T10:00:00Z');
    const b1 = new Date('2025-01-15T09:30:00Z');
    const b2 = new Date('2025-01-15T10:30:00Z');

    expect(doRangesOverlap(a1, a2, b1, b2))
      .toBe(doRangesOverlap(b1, b2, a1, a2));
  });
});

describe('getMinutesFromMidnight', () => {
  it('should return 0 for midnight', () => {
    // Mock TZDate just returns the date as-is
    const midnight = new Date(2025, 0, 15, 0, 0);
    expect(getMinutesFromMidnight(midnight)).toBe(0);
  });

  it('should return 540 for 9:00 AM', () => {
    const nineAm = new Date(2025, 0, 15, 9, 0);
    expect(getMinutesFromMidnight(nineAm)).toBe(540);
  });

  it('should handle fractional hours', () => {
    const tenThirty = new Date(2025, 0, 15, 10, 30);
    expect(getMinutesFromMidnight(tenThirty)).toBe(630);
  });
});

describe('getDayIndex', () => {
  it('should return correct day index for Wednesday', () => {
    // Jan 15, 2025 is a Wednesday (3 in JS getDay())
    const wednesday = new Date(2025, 0, 15);
    expect(getDayIndex(wednesday)).toBe(3);
  });

  it('should return 0 for Sunday', () => {
    // Jan 19, 2025 is a Sunday
    const sunday = new Date(2025, 0, 19);
    expect(getDayIndex(sunday)).toBe(0);
  });

  it('should return 1 for Monday', () => {
    // Jan 13, 2025 is a Monday
    const monday = new Date(2025, 0, 13);
    expect(getDayIndex(monday)).toBe(1);
  });

  it('should return 6 for Saturday', () => {
    // Jan 18, 2025 is a Saturday
    const saturday = new Date(2025, 0, 18);
    expect(getDayIndex(saturday)).toBe(6);
  });
});
