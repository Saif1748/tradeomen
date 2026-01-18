import React, { useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { fetchBackendProfile } from '../services/api/core';
// ✅ FIX: Import UserRole to ensure strict typing for RBAC
import { UserProfile, PlanTier, UserRole } from '../services/api/types';
import { AuthContext } from '../hooks/use-Auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Loading: Initial Supabase Check
  const [loading, setLoading] = useState(true);
  // IsSyncing: Python Backend Handshake
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Syncs the Supabase Session with your Python Backend Database.
   * This is critical for fetching 'role', 'plan_tier', and 'quotas'.
   */
  const syncBackendProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.access_token) {
      setProfile(null);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      // 1. Fetch data from Python Backend
      const backendData = await fetchBackendProfile();
      
      if (backendData) {
        // 2. Normalize Data (Defense against dirty DB data)
        const safeRole = (backendData.role || "user") as UserRole;
        const safePlan = (backendData.plan_tier || "FREE").toUpperCase() as PlanTier;

        setProfile({
            ...backendData,
            role: safeRole,
            plan_tier: safePlan
        });
      }
    } catch (err: any) {
      console.error("Handshake Error (Backend):", err);
      // We don't log the user out on backend error, just show an alert if needed
      setError(err.message || "Engine synchronization failed");
    } finally {
      // 3. Always release the lock so UI can render
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // 1. Check local Supabase session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);
            // 2. Trigger Backend Sync (Non-blocking for initial render, but blocks ProtectedRoute)
            // Note: We don't await this here to allow 'loading' to finish fast, 
            // but 'isSyncing' will keep the ProtectedRoute waiting.
            syncBackendProfile(initialSession);
          }
          setLoading(false); 
        }
      } catch (e) {
        console.error("Init Error:", e);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // 3. Listen for Auth Changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Re-sync profile on login or if token rotates
          if (newSession) syncBackendProfile(newSession);
        }
        
        if (event === 'SIGNED_OUT') {
          // Clear everything on logout
          setProfile(null);
          setSession(null);
          setUser(null);
          setError(null);
          setIsSyncing(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncBackendProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setProfile(null);
      setUser(null);
      setSession(null);
      setIsSyncing(false);
    }
  };

  const refreshProfile = async () => {
    if (session) await syncBackendProfile(session);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      loading, 
      isSyncing,
      error, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};