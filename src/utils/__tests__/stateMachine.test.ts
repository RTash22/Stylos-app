/**
 * Tests for utils/stateMachine.ts
 */
import {
  STATE_TRANSITIONS,
  getAvailableTransitions,
  STATUS_LABELS,
  STATUS_ICONS,
} from '../stateMachine';

describe('STATE_TRANSITIONS', () => {
  it('should define transitions for all statuses', () => {
    const allStatuses = [
      'pendiente', 'confirmada', 'reprogramacion_propuesta',
      'rechazada', 'cancelada', 'completada', 'no_asistio',
    ];

    for (const status of allStatuses) {
      expect(STATE_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(STATE_TRANSITIONS[status as keyof typeof STATE_TRANSITIONS])).toBe(true);
    }
  });

  it('should have empty transitions for terminal states', () => {
    expect(STATE_TRANSITIONS.rechazada).toEqual([]);
    expect(STATE_TRANSITIONS.cancelada).toEqual([]);
    expect(STATE_TRANSITIONS.completada).toEqual([]);
    expect(STATE_TRANSITIONS.no_asistio).toEqual([]);
  });

  it('should allow barber to accept/reject pending appointments', () => {
    const transitions = STATE_TRANSITIONS.pendiente;
    const acceptTransition = transitions.find(t => t.to === 'confirmada');
    const rejectTransition = transitions.find(t => t.to === 'rechazada');

    expect(acceptTransition).toBeDefined();
    expect(acceptTransition!.role).toBe('peluquero');
    expect(rejectTransition).toBeDefined();
    expect(rejectTransition!.role).toBe('peluquero');
  });

  it('should allow completing from confirmada only', () => {
    const confirmadaTransitions = STATE_TRANSITIONS.confirmada;
    const completeTransition = confirmadaTransitions.find(t => t.to === 'completada');
    expect(completeTransition).toBeDefined();
    expect(completeTransition!.requiresNote).toBe(true);

    // Not available from other statuses
    const pendienteTransitions = STATE_TRANSITIONS.pendiente;
    expect(pendienteTransitions.find(t => t.to === 'completada')).toBeUndefined();
  });

  it('should require confirmation on all destructive transitions', () => {
    const confirmada = STATE_TRANSITIONS.confirmada;
    const noShow = confirmada.find(t => t.to === 'no_asistio');
    const cancel = confirmada.find(t => t.to === 'cancelada');

    expect(noShow!.requiresConfirmation).toBe(true);
    expect(cancel!.requiresConfirmation).toBe(true);
  });
});

describe('getAvailableTransitions', () => {
  it('should return barber-specific transitions for barber role', () => {
    const transitions = getAvailableTransitions('pendiente', 'peluquero');

    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions) {
      expect(['peluquero', 'any']).toContain(t.role);
    }
  });

  it('should return admin-specific transitions for admin role', () => {
    const transitions = getAvailableTransitions('pendiente', 'admin');

    // Admin can cancel pendiente
    const cancelTransition = transitions.find(t => t.to === 'cancelada');
    expect(cancelTransition).toBeDefined();

    // Admin should not get barber-only transitions
    const barberOnly = transitions.filter(t => t.role === 'peluquero');
    expect(barberOnly).toHaveLength(0);
  });

  it('should return empty array for terminal states', () => {
    expect(getAvailableTransitions('completada', 'peluquero')).toEqual([]);
    expect(getAvailableTransitions('completada', 'admin')).toEqual([]);
    expect(getAvailableTransitions('rechazada', 'peluquero')).toEqual([]);
    expect(getAvailableTransitions('cancelada', 'admin')).toEqual([]);
    expect(getAvailableTransitions('no_asistio', 'peluquero')).toEqual([]);
  });

  it('should return "any" role transitions for both barber and admin', () => {
    const barberTransitions = getAvailableTransitions('confirmada', 'peluquero');
    const adminTransitions = getAvailableTransitions('confirmada', 'admin');

    const barberCancel = barberTransitions.find(t => t.to === 'cancelada');
    const adminCancel = adminTransitions.find(t => t.to === 'cancelada');

    // Both should have cancel (role: 'any')
    expect(barberCancel).toBeDefined();
    expect(adminCancel).toBeDefined();
  });

  it('should allow reprogramación from both pendiente and confirmada', () => {
    const fromPendiente = getAvailableTransitions('pendiente', 'peluquero');
    const fromConfirmada = getAvailableTransitions('confirmada', 'peluquero');

    expect(fromPendiente.find(t => t.to === 'reprogramacion_propuesta')).toBeDefined();
    expect(fromConfirmada.find(t => t.to === 'reprogramacion_propuesta')).toBeDefined();
  });
});

describe('STATUS_LABELS', () => {
  it('should have Spanish labels for all statuses', () => {
    expect(STATUS_LABELS.pendiente).toBe('Pendiente');
    expect(STATUS_LABELS.confirmada).toBe('Confirmada');
    expect(STATUS_LABELS.reprogramacion_propuesta).toBe('Reprogramación propuesta');
    expect(STATUS_LABELS.rechazada).toBe('Rechazada');
    expect(STATUS_LABELS.cancelada).toBe('Cancelada');
    expect(STATUS_LABELS.completada).toBe('Completada');
    expect(STATUS_LABELS.no_asistio).toBe('No asistió');
  });
});

describe('STATUS_ICONS', () => {
  it('should have icons for all statuses', () => {
    const allStatuses = [
      'pendiente', 'confirmada', 'reprogramacion_propuesta',
      'rechazada', 'cancelada', 'completada', 'no_asistio',
    ];

    for (const status of allStatuses) {
      expect(STATUS_ICONS[status as keyof typeof STATUS_ICONS]).toBeDefined();
      expect(typeof STATUS_ICONS[status as keyof typeof STATUS_ICONS]).toBe('string');
    }
  });
});
