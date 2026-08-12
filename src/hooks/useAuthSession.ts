import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuthSessionState {
  userId: string | null;
  isAuthenticated: boolean;
  /** true tant que la session n'a pas été résolue côté client */
  loading: boolean;
}

/** Session Supabase côté navigateur (lecture seule, pas de garde de route). */
export function useAuthSession(): AuthSessionState {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUserId(data.session?.user.id ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, isAuthenticated: userId !== null, loading };
}
