/**
 * El Stylo Salón — Application Constants
 */

export const APP_NAME = 'El Stylo' as const;
export const APP_FULL_NAME = 'El Stylo Salón' as const;
export const TIMEZONE = 'America/Monterrey' as const;

/** Working-day boundaries (configurable per barber, but these are the defaults) */
export const DEFAULT_WORK_START_HOUR = 9;
export const DEFAULT_WORK_END_HOUR = 20;
export const DEFAULT_BREAK_START_HOUR = 14;
export const DEFAULT_BREAK_END_HOUR = 15;

/** Appointment durations in minutes */
export const APPOINTMENT_DURATIONS = [30, 45, 60, 90] as const;
export type AppointmentDuration = (typeof APPOINTMENT_DURATIONS)[number];

/** The schedule grid slot size in minutes */
export const SCHEDULE_SLOT_MINUTES = 30;

/** Pixels per minute for schedule rendering */
export const PX_PER_MINUTE = 1.5;

/** Minimum touch target size (accessibility) */
export const MIN_TOUCH_TARGET = 44;

/** Strike threshold for requiring deposit */
export const STRIKE_THRESHOLD = 3;

/** Default deposit expiration in minutes */
export const DEFAULT_DEPOSIT_EXPIRY_MINUTES = 120;
