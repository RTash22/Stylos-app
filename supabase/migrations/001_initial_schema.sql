-- ======================================================
-- El Stylo Salón — Supabase Database Schema
-- ======================================================
-- Run this in the Supabase SQL Editor (or as a migration)
-- to set up all tables, RLS policies, functions, and triggers.
-- ======================================================

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ======================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'barber' CHECK (role IN ('barber', 'admin')),
  full_name  TEXT NOT NULL DEFAULT '',
  phone      TEXT,
  avatar_url TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'barber')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 2. CLIENTS
-- ======================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT,
  strikes          INTEGER NOT NULL DEFAULT 0 CHECK (strikes >= 0),
  requires_deposit BOOLEAN NOT NULL DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view clients
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

-- Barbers and admins can insert/update clients
CREATE POLICY "Authenticated users can insert clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ======================================================
-- 3. SERVICES
-- ======================================================
CREATE TABLE IF NOT EXISTS public.services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All can view active services"
  ON public.services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 4. WORKING HOURS
-- ======================================================
CREATE TABLE IF NOT EXISTS public.working_hours (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL DEFAULT '09:00',
  end_time     TIME NOT NULL DEFAULT '20:00',
  break_start  TIME,
  break_end    TIME,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (barber_id, day_of_week)
);

ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can view own hours"
  ON public.working_hours FOR SELECT
  USING (auth.uid() = barber_id);

CREATE POLICY "Admins can view all hours"
  ON public.working_hours FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Barbers can manage own hours"
  ON public.working_hours FOR ALL
  USING (auth.uid() = barber_id)
  WITH CHECK (auth.uid() = barber_id);

-- ======================================================
-- 5. TIME BLOCKS (manual schedule blocks)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.time_blocks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can manage own blocks"
  ON public.time_blocks FOR ALL
  USING (auth.uid() = barber_id)
  WITH CHECK (auth.uid() = barber_id);

CREATE POLICY "Admins can view all blocks"
  ON public.time_blocks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 6. APPOINTMENTS
-- ======================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  barber_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  service_id          UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (status IN (
                        'pendiente','confirmada','reprogramacion_propuesta',
                        'rechazada','cancelada','completada','no_asistio'
                      )),
  notes               TEXT,
  proposed_starts_at  TIMESTAMPTZ,
  proposed_ends_at    TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_appointments_barber_date
  ON public.appointments (barber_id, starts_at);

CREATE INDEX idx_appointments_client
  ON public.appointments (client_id);

CREATE INDEX idx_appointments_status
  ON public.appointments (status);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = barber_id);

CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Barbers can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = barber_id)
  WITH CHECK (auth.uid() = barber_id);

CREATE POLICY "Admins can manage all appointments"
  ON public.appointments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 7. DEPOSITS
-- ======================================================
CREATE TABLE IF NOT EXISTS public.deposits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id    UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  amount            NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  reference         TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (status IN (
                      'pendiente','comprobante_recibido','verificado','rechazado','expirado'
                    )),
  proof_path        TEXT,
  proof_uploaded_at TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ NOT NULL,
  verified_by       UUID REFERENCES public.profiles(id),
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deposits_status
  ON public.deposits (status);

CREATE TRIGGER deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deposits"
  ON public.deposits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage deposits"
  ON public.deposits FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 8. AESTHETIC NOTES
-- ======================================================
CREATE TABLE IF NOT EXISTS public.aesthetic_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  appointment_id  UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  barber_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  procedure       TEXT NOT NULL DEFAULT '',
  products_used   TEXT,
  observations    TEXT,
  recommendations TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_aesthetic_notes_client
  ON public.aesthetic_notes (client_id);

CREATE TRIGGER aesthetic_notes_updated_at
  BEFORE UPDATE ON public.aesthetic_notes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE public.aesthetic_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can manage own notes"
  ON public.aesthetic_notes FOR ALL
  USING (auth.uid() = barber_id)
  WITH CHECK (auth.uid() = barber_id);

CREATE POLICY "Admins can view all notes"
  ON public.aesthetic_notes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 9. STRIKE RECORDS (audit trail)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.strike_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  reason         TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleared_by     UUID REFERENCES public.profiles(id),
  cleared_at     TIMESTAMPTZ,
  cleared_reason TEXT,
  previous_count INTEGER
);

ALTER TABLE public.strike_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view strikes"
  ON public.strike_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage strikes"
  ON public.strike_records FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ======================================================
-- 10. DEVICE TOKENS (push notifications)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON public.device_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ======================================================
-- 11. NOTIFICATIONS (in-app)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, read)
  WHERE read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ======================================================
-- 12. BANK SETTINGS (singleton config)
-- ======================================================
CREATE TABLE IF NOT EXISTS public.bank_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name        TEXT NOT NULL DEFAULT '',
  beneficiary      TEXT NOT NULL DEFAULT '',
  clabe            TEXT NOT NULL DEFAULT '',
  default_amount   NUMERIC(10,2) NOT NULL DEFAULT 200.00,
  payment_minutes  INTEGER NOT NULL DEFAULT 30,
  deposits_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by       UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.bank_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bank settings"
  ON public.bank_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update bank settings"
  ON public.bank_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default bank settings row
INSERT INTO public.bank_settings (bank_name, beneficiary, clabe)
VALUES ('', '', '')
ON CONFLICT DO NOTHING;

-- ======================================================
-- 13. FUNCTIONS
-- ======================================================

-- Function: Increment client strikes
CREATE OR REPLACE FUNCTION public.increment_client_strikes(
  p_client_id UUID,
  p_appointment_id UUID,
  p_reason TEXT
)
RETURNS void AS $$
DECLARE
  v_current_strikes INTEGER;
BEGIN
  SELECT strikes INTO v_current_strikes
  FROM public.clients
  WHERE id = p_client_id;

  -- Record the strike
  INSERT INTO public.strike_records (client_id, appointment_id, reason, previous_count)
  VALUES (p_client_id, p_appointment_id, p_reason, v_current_strikes);

  -- Increment strikes
  UPDATE public.clients
  SET strikes = strikes + 1,
      requires_deposit = CASE WHEN strikes + 1 >= 3 THEN TRUE ELSE requires_deposit END
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clear client strikes
CREATE OR REPLACE FUNCTION public.clear_client_strikes(
  p_client_id UUID,
  p_cleared_by UUID,
  p_reason TEXT
)
RETURNS void AS $$
DECLARE
  v_current_strikes INTEGER;
BEGIN
  SELECT strikes INTO v_current_strikes
  FROM public.clients
  WHERE id = p_client_id;

  -- Record the clearing
  INSERT INTO public.strike_records (client_id, reason, cleared_by, cleared_at, cleared_reason, previous_count)
  VALUES (p_client_id, 'Strike cleared', p_cleared_by, NOW(), p_reason, v_current_strikes);

  -- Reset strikes
  UPDATE public.clients
  SET strikes = 0, requires_deposit = FALSE
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- 14. REALTIME
-- ======================================================
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ======================================================
-- 15. STORAGE BUCKET
-- ======================================================
-- Create storage bucket for deposit proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-proofs', 'deposit-proofs', FALSE)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'deposit-proofs');

CREATE POLICY "Authenticated users can view proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'deposit-proofs');
