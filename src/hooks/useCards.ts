import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@/src/services/firebase";

export type SavedCard = {
  card_id: string;
  token: string;
  brand: string;
  last_four: string;
  holder_name: string;
};

export function useCards(uid: string | null) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setCards([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "users", uid, "cards"), orderBy("created_at", "desc"));
    return onSnapshot(q, (snap) => {
      setCards(snap.docs.map((d) => ({ card_id: d.id, ...d.data() } as SavedCard)));
      setLoading(false);
    });
  }, [uid]);

  async function addCard(uid: string, card: Omit<SavedCard, "card_id">) {
    await addDoc(collection(db, "users", uid, "cards"), {
      ...card,
      created_at: serverTimestamp(),
    });
  }

  return { cards, loading, addCard };
}
