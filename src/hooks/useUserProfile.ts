import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type UserRole = "client" | "cleaner";

export type UserProfile = {
  user_id: string;
  email: string;
  name?: string;
  role: UserRole[];
  trust_score?: number;
  client_terms_accepted?: boolean;
};

export function useUserProfile(uid: string | null) {
  // Mesma guarda de useCleanerProfile.ts: sem isso, quando uid muda de null
  // pra um valor real, o hook devolve profile/loading do uid antigo por um
  // render (até o useEffect rodar), e useRoleGuard pode ler role=null e
  // redirecionar pro role-choice por engano.
  const [state, setState] = useState<{ uid: string | null; profile: UserProfile | null; loading: boolean }>({
    uid: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    if (!uid) {
      setState({ uid, profile: null, loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(doc(db, "users", uid), (snap) => {
      const data = snap.data();
      setState({ uid, profile: data ? ({ ...data, role: data.role ?? [] } as UserProfile) : null, loading: false });
    });
  }, [uid]);

  const stale = state.uid !== uid;
  const profile = stale ? null : state.profile;
  return { profile, role: profile?.role ?? null, loading: stale || state.loading };
}
