/**
 * Authentication Provider.
 *
 * Manages Supabase session, fetches user profile (with role),
 * and provides auth state to the entire app via context.
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthState {
  /** True while initial session is loading or while profile is loading for an active session */
  loading: boolean;
  /** True only while initial session from storage is being resolved */
  isInitializing: boolean;
  /** True only while user profile is being fetched from database */
  isProfileLoading: boolean;
  /** Controlled error message when profile fetch fails, is missing, or account is inactive */
  profileError: string | null;
  /** Supabase session (null if signed out) */
  session: Session | null;
  /** Supabase auth user */
  user: User | null;
  /** User profile from `profiles` table (role lives here) */
  profile: Profile | null;
  /** Shorthand role from profile */
  role: UserRole | null;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign out and clear session */
  signOut: () => Promise<void>;
  /** Send password reset email */
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  /** Refresh the profile from the database */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const signingOutRef = useRef(false);

  /**
   * 1. Synchronous Auth State Listener
   *
   * Listens for session changes and updates local session state synchronously.
   * Does NOT perform async work, Supabase queries, or signOut inside this callback.
   */
  useEffect(() => {
    let isMounted = true;

    // Get initial session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        setIsInitializing(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[Auth] Error getting initial session:', err);
        setIsInitializing(false);
      });

    // Subscribe to auth changes synchronously
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setIsInitializing(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * 2. Separate Profile Fetch Effect
   *
   * Triggers strictly outside onAuthStateChange when session user ID changes.
   * Cancels stale requests and handles inactive / missing profiles cleanly.
   */
  useEffect(() => {
    let isCancelled = false;
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      setProfile(null);
      setProfileError(null);
      setIsProfileLoading(false);
      return;
    }

    const userId = currentUserId;
    setProfile(null);
    setProfileError(null);
    setIsProfileLoading(true);

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (isCancelled) return;

        if (error) {
          console.warn('[Auth] Profile fetch error:', error.message);
          setProfile(null);
          setProfileError('Error al cargar la información del perfil.');
          return;
        }

        if (!data) {
          console.warn('[Auth] Profile not found for user:', userId);
          setProfile(null);
          setProfileError('No se encontró un perfil registrado para este usuario.');
          return;
        }

        if (!data.is_active) {
          console.warn('[Auth] User is inactive, signing out.');
          setProfile(null);
          setProfileError('Esta cuenta se encuentra desactivada. Contacta al administrador.');

          if (!signingOutRef.current) {
            signingOutRef.current = true;
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.error('[Auth] Error signing out inactive user:', err);
            } finally {
              signingOutRef.current = false;
            }
          }
          return;
        }

        setProfile(data);
        setProfileError(null);
      } catch (err) {
        if (isCancelled) return;
        console.error('[Auth] Profile fetch failed:', err);
        setProfile(null);
        setProfileError('Error de conexión al cargar el perfil.');
      } finally {
        if (!isCancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [session?.user?.id, refreshTrigger]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    setProfile(null);
    setProfileError(null);
    setSession(null);
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const loading = isInitializing || (session !== null && isProfileLoading && profile === null && profileError === null);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      isInitializing,
      isProfileLoading,
      profileError,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [
      loading,
      isInitializing,
      isProfileLoading,
      profileError,
      session,
      profile,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume auth context */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
