import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type Address = {
  address_id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
};

export function useAddresses(uid: string | null) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "users", uid, "addresses"), orderBy("created_at", "desc"));
    return onSnapshot(q, (snap) => {
      setAddresses(snap.docs.map((d) => ({ address_id: d.id, ...d.data() } as Address)));
      setLoading(false);
    });
  }, [uid]);

  async function addAddress(uid: string, address: Omit<Address, "address_id">) {
    await addDoc(collection(db, "users", uid, "addresses"), {
      ...address,
      created_at: serverTimestamp(),
    });
  }

  return { addresses, loading, addAddress };
}
