/**
 * ResponsiveSchedule — Switches between DayTimeline (phone) and WeekCalendar (tablet).
 */
import React from 'react';
import { useResponsive } from '@/hooks';
import { DayTimeline } from '@/components/calendar/DayTimeline';
import { WeekCalendar } from '@/components/calendar/WeekCalendar';
import type { Appointment, WorkingHours, TimeBlock } from '@/types';
import { getWeekStart, getDayIndex } from '@/utils/dates';

interface Props {
  selectedDate: Date;
  appointments: Appointment[];
  workingHours: WorkingHours | undefined;
  timeBlocks: TimeBlock[];
  onAppointmentPress: (appointment: Appointment) => void;
  onAvailablePress?: (startMinutes: number) => void;
  onDayPress?: (date: Date) => void;
}

export function ResponsiveSchedule({
  selectedDate,
  appointments,
  workingHours,
  timeBlocks,
  onAppointmentPress,
  onAvailablePress,
  onDayPress,
}: Props) {
  const { isTabletLandscape } = useResponsive();

  if (isTabletLandscape) {
    return (
      <WeekCalendar
        weekStart={getWeekStart(selectedDate)}
        appointments={appointments}
        onAppointmentPress={onAppointmentPress}
        onDayPress={onDayPress}
      />
    );
  }

  return (
    <DayTimeline
      date={selectedDate}
      workingHours={workingHours}
      appointments={appointments}
      timeBlocks={timeBlocks}
      onAppointmentPress={onAppointmentPress}
      onAvailablePress={onAvailablePress}
    />
  );
}
