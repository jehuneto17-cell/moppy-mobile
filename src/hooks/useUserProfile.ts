import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type UserRole = "client" | "cleaner";

export function useUserProfile(uid: string | null) {
  const [role, setRole] = useState<UserRole[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(doc(db, "users", uid), (snap) => {
      setRole((snap.data()?.role as UserRole[]) ?? []);
      setLoading(false);
    });
  }, [uid]);

  return { role, loading };
}
