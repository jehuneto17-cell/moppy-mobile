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
};

export function useUserProfile(uid: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(doc(db, "users", uid), (snap) => {
      const data = snap.data();
      setProfile(data ? ({ ...data, role: data.role ?? [] } as UserProfile) : null);
      setLoading(false);
    });
  }, [uid]);

  return { profile, role: profile?.role ?? null, loading };
}
