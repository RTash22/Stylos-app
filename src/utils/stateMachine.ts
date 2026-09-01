/**
 * Appointment state machine.
 *
 * Defines which status transitions are allowed, and from which roles.
 */
import type { AppointmentStatus, UserRole } from '@/types';

interface Transition {
  to: AppointmentStatus;
  label: string;
  role: UserRole | 'any';
  requiresConfirmation: boolean;
  requiresNote?: boolean;
}

export const STATE_TRANSITIONS: Record<AppointmentStatus, Transition[]> = {
  pendiente: [
    { to: 'confirmada', label: 'Aceptar', role: 'barber', requiresConfirmation: true },
    { to: 'rechazada', label: 'Rechazar', role: 'barber', requiresConfirmation: true },
    { to: 'reprogramacion_propuesta', label: 'Proponer otro horario', role: 'barber', requiresConfirmation: true },
    { to: 'cancelada', label: 'Cancelar', role: 'admin', requiresConfirmation: true },
  ],
  confirmada: [
    { to: 'completada', label: 'Completar', role: 'barber', requiresConfirmation: true, requiresNote: true },
    { to: 'no_asistio', label: 'No asistió', role: 'barber', requiresConfirmation: true },
    { to: 'reprogramacion_propuesta', label: 'Reprogramar', role: 'barber', requiresConfirmation: true },
    { to: 'cancelada', label: 'Cancelar', role: 'any', requiresConfirmation: true },
  ],
  reprogramacion_propuesta: [
    { to: 'confirmada', label: 'Aceptar propuesta', role: 'any', requiresConfirmation: false },
    { to: 'rechazada', label: 'Rechazar propuesta', role: 'any', requiresConfirmation: true },
    { to: 'cancelada', label: 'Cancelar', role: 'any', requiresConfirmation: true },
  ],
  rechazada: [],
  cancelada: [],
  completada: [],
  no_asistio: [],
};

/** Get valid transitions for a given status + user role */
export function getAvailableTransitions(
  currentStatus: AppointmentStatus,
  userRole: UserRole,
): Transition[] {
  const transitions = STATE_TRANSITIONS[currentStatus] ?? [];
  return transitions.filter((t) => t.role === 'any' || t.role === userRole);
}

/** Human-readable status labels in Spanish */
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  reprogramacion_propuesta: 'Reprogramación propuesta',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  completada: 'Completada',
  no_asistio: 'No asistió',
};

/** Icons for each status */
export const STATUS_ICONS: Record<AppointmentStatus, string> = {
  pendiente: 'clock-outline',
  confirmada: 'check-circle-outline',
  reprogramacion_propuesta: 'calendar-clock',
  rechazada: 'close-circle-outline',
  cancelada: 'cancel',
  completada: 'check-all',
  no_asistio: 'account-off-outline',
};
