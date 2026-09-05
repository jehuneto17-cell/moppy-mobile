import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { Button } from "@/src/components/ui/Button";
import { Rating } from "@/src/components/ui/Rating";
import { Spinner } from "@/src/components/ui/Spinner";
import { auth, db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

type Application = { cleaner_id: string; cleaner_name: string; cleaner_rating: number; cleaner_distance_km: number };
type Review = { review_id: string; comment: string; stars: number; from_name?: string };

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function CandidataScreen() {
  const { id, candidateId } = useLocalSearchParams<{ id: string; candidateId: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);

  useEffect(() => {
    if (!id || !candidateId) return;
    getDoc(doc(db, "orders", id, "applications", candidateId)).then((snap) => {
      setApplication(snap.exists() ? (snap.data() as Application) : null);
      setLoading(false);
    });
  }, [id, candidateId]);

  useEffect(() => {
    if (!candidateId) return;
    const q = query(collection(db, "reviews"), where("to_user_id", "==", candidateId), where("visible", "==", true));
    return onSnapshot(q, (snap) => setReviews(snap.docs.slice(0, 3).map((d) => ({ review_id: d.id, ...d.data() } as Review))));
  }, [candidateId]);

  async function handleChoose() {
    if (!id || !candidateId || !application || choosing) return;
    setChoosing(true);

    const appsSnap = await getDocs(collection(db, "orders", id, "applications"));
    await Promise.all(
      appsSnap.docs.map((d) => updateDoc(d.ref, { status: d.id === candidateId ? "selected" : "declined" }))
    );

    const arrivalCode = randomCode();
    await updateDoc(doc(db, "orders", id), {
      cleaner_id: candidateId,
      cleaner_name: application.cleaner_name,
      cleaner_rating: application.cleaner_rating,
      status: "confirmed",
      arrival_code: arrivalCode,
      updated_at: serverTimestamp(),
    });

    await setDoc(doc(db, "chats", id), {
      order_id: id,
      participants: { client_id: (await getDoc(doc(db, "orders", id))).data()?.client_id, cleaner_id: candidateId },
      created_at: serverTimestamp(),
    });

    // Se faltar menos de 24h pro serviço, o cron D-1 não vai passar a tempo — cobra
    // agora (o endpoint decide; sem isso o pedido chegaria ao dia sem cobrança).
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${id}/charge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      }).catch(() => {});
    }

    setChoosing(false);
    router.replace(`/(client)/pedido/${id}`);
  }

  if (loading || !application) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.xxl, paddingBottom: 112 }}>
        <View style={styles.header}>
          <Avatar name={application.cleaner_name} size="xlarge" />
          <Text style={styles.name}>{application.cleaner_name}</Text>
          <Rating value={Math.round(application.cleaner_rating)} readonly size="medium" />
          <Text style={styles.meta}>{application.cleaner_rating.toFixed(1)} · {application.cleaner_distance_km.toFixed(1)} km de distância</Text>
        </View>

        <View style={{ marginTop: space.xxl }}>
          <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
          {reviews.length === 0 && <Text style={styles.emptyReviews}>Ainda sem avaliações.</Text>}
          <View style={{ gap: space.m }}>
            {reviews.map((r) => (
              <View key={r.review_id} style={styles.reviewCard}>
                {r.from_name && <Text style={styles.reviewerName}>{r.from_name}</Text>}
                <Rating value={r.stars} readonly size="small" />
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" size="large" loading={choosing} onPress={handleChoose} style={{ width: "100%" }}>
          {`Escolher ${application.cleaner_name.split(" ")[0]}`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { alignItems: "center", marginTop: space.l, gap: space.s },
  name: { fontFamily: font.bold, fontSize: font.h1, color: C.textMaximum, marginTop: space.m },
  meta: { fontFamily: font.regular, fontSize: font.labelSm, color: C.textSecondary },
  sectionTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginBottom: space.m },
  emptyReviews: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary },
  reviewCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: radius.l, padding: space.l, gap: space.s },
  reviewerName: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  reviewComment: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textMaximum, lineHeight: 18 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: space.l, paddingHorizontal: space.xxl, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border },
});
