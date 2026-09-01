/**
 * El Stylo Salón — Database Types
 *
 * These types mirror the Supabase schema.
 * When connected, regenerate with: npx supabase gen types typescript
 */

export type UserRole = 'barber' | 'admin';

export type AppointmentStatus =
  | 'pendiente'
  | 'confirmada'
  | 'reprogramacion_propuesta'
  | 'rechazada'
  | 'cancelada'
  | 'completada'
  | 'no_asistio';

export type DepositStatus =
  | 'pendiente'
  | 'comprobante_recibido'
  | 'verificado'
  | 'rechazado'
  | 'expirado';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  strikes: number;
  requires_deposit: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  proposed_starts_at: string | null;
  proposed_ends_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  service?: Service;
  barber?: Profile;
  deposit?: Deposit;
}

export interface Deposit {
  id: string;
  appointment_id: string;
  client_id: string;
  amount: number;
  reference: string;
  status: DepositStatus;
  proof_path: string | null;
  proof_uploaded_at: string | null;
  expires_at: string;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  id: string;
  barber_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_active: boolean;
}

export interface TimeBlock {
  id: string;
  barber_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
}

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

export interface StrikeRecord {
  id: string;
  client_id: string;
  appointment_id: string | null;
  reason: string;
  created_at: string;
  cleared_by: string | null;
  cleared_at: string | null;
  cleared_reason: string | null;
  previous_count: number | null;
}

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'android' | 'ios';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankSettings {
  id: string;
  bank_name: string;
  beneficiary: string;
  clabe: string;
  default_amount: number;
  payment_minutes: number;
  deposits_enabled: boolean;
  updated_at: string;
  updated_by: string;
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
