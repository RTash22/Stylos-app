/**
 * El Stylo Salón — Database Types
 *
 * These types mirror the Supabase schema.
 * When connected, regenerate with: npx supabase gen types typescript
 */

import { Database } from './supabase.generated';

export type UserRole = Database['public']['Enums']['profile_role'];

export type AppointmentStatus = Database['public']['Enums']['appointment_status'];

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Client = Database['public']['Tables']['clients']['Row'];

export type Service = Database['public']['Tables']['services']['Row'];

export type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  client?: Client;
  service?: Service;
  barber?: Profile;
};

// Map old schema to new schema types temporarily for compilation
export type WorkingHours = Database['public']['Tables']['barber_availability']['Row'];
export type TimeBlock = Database['public']['Tables']['barber_time_off']['Row'];

// Note: aesthetic_notes, strike_records, device_tokens, bank_settings, and notifications 
// may need mapping to their new table equivalents.
export type StrikeRecord = Database['public']['Tables']['client_strike_events']['Row'];
export type DeviceToken = Database['public']['Tables']['expo_push_tokens']['Row'];
export type BankSettings = Database['public']['Tables']['business_settings']['Row'];

// --- TEMPORARY LEGACY TYPES ---
// These tables do not exist in the remote schema but the UI currently expects them.
// We declare them manually to allow the app to compile for the Auth test.

export interface AestheticNote {
  id: string;
  client_id: string;
  appointment_id: string;
  barber_id: string;
  procedure: string;
  products_used: string | null;
  observations: string | null;
  recommendations: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  sent_at: string;
  created_at: string;
}
