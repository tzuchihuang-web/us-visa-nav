/**
 * useAuth Hook - Supabase Authentication Management
 * 
 * Provides authentication functionality for the app:
 * - Sign up with email/password
 * - Sign in with email/password
 * - Sign out
 * - Get current user
 * - Check authentication status
 * - Error handling
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

// Initialize Supabase client lazily
const getSupabaseClient = () => {
  if (!supabase && typeof window !== "undefined") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.warn("Supabase credentials not configured");
      return null;
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const checkAuth = async () => {
      const client = getSupabaseClient();
      if (!client) {
        setAuthState({
          user: null,
          loading: false,
          error: "Supabase not configured",
        });
        setSupabaseReady(true);
        return;
      }

      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (session?.user) {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name,
              created_at: session.user.created_at,
            },
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthState({
          user: null,
          loading: false,
          error: "Failed to check authentication status",
        });
      } finally {
        setSupabaseReady(true);
      }
    };

    checkAuth();

    // Listen for auth changes
    const client = getSupabaseClient();
    if (!client) return;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            created_at: session.user.created_at,
          },
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, error: "Supabase not configured" };
      }

      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setAuthState({
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name,
              created_at: data.user.created_at,
            },
            loading: false,
            error: null,
          });

          // Redirect to home after successful signup
          router.push("/");
          return { success: true };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Sign up failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [router]
  );

  // Sign in with email and password
  const signIn = useCallback(
    async (email: string, password: string) => {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, error: "Supabase not configured" };
      }

      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setAuthState({
            user: {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name,
              created_at: data.user.created_at,
            },
            loading: false,
            error: null,
          });

          // Redirect to home after successful signin
          router.push("/");
          return { success: true };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Sign in failed";
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [router]
  );

  // Sign out
  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthState({
        user: null,
        loading: false,
        error: "Supabase not configured",
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        loading: false,
        error: null,
      });

      // Redirect to auth page after sign out
      router.push("/auth");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign out failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [router]);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!authState.user,
  };
}
