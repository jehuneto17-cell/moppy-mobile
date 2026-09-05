import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Rating } from "@/src/components/ui/Rating";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, space } from "@/src/theme";

// Tela de avaliação (C25/F15) — mesma UI dos dois lados, só muda quem avalia quem.
export function ReviewScreen({ orderId, toUserId, toUserName }: { orderId: string; toUserId: string; toUserName: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!user) return;
    setSaving(true);
    await addDoc(collection(db, "reviews"), {
      order_id: orderId,
      from_user_id: user.uid,
      from_name: user.displayName ?? null,
      to_user_id: toUserId,
      stars: rating,
      comment,
      visible: true,
      submitted_at: serverTimestamp(),
    });
    setSaving(false);
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como foi {toUserName ? `com ${toUserName}` : "o serviço"}?</Text>

      <View style={styles.ratingRow}>
        <Rating value={rating} size="large" onChange={setRating} />
      </View>

      <Text style={styles.label}>Deixe um comentário (opcional)</Text>
      <Input
        multiline
        numberOfLines={5}
        placeholder="Conte como foi a experiência..."
        value={comment}
        onChangeText={(t) => setComment(t.slice(0, 500))}
        style={styles.textarea}
      />
      <Text style={styles.charCount}>{comment.length}/500</Text>

      <Button variant="primary" size="large" loading={saving} onPress={handleSubmit} style={{ marginTop: space.xl }}>
        Enviar avaliação
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, textAlign: "center", marginTop: space.xl },
  ratingRow: { alignItems: "center", marginTop: space.xxl, marginBottom: space.xxl },
  label: { fontFamily: font.bold, fontSize: font.body, color: C.textMaximum, marginBottom: space.s },
  textarea: { height: 120, textAlignVertical: "top" },
  charCount: { fontFamily: font.regular, fontSize: font.caption, color: C.textSecondary, textAlign: "right", marginTop: 4 },
});
