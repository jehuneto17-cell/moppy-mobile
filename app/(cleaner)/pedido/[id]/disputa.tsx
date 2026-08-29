import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Input } from "@/src/components/ui/Input";
import { Spinner } from "@/src/components/ui/Spinner";
import { uploadImage } from "@/src/services/cloudinary";
import { db } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

const MIN_CHARS = 50;

type Dispute = { dispute_id: string; client_claim: { description: string; photos: string[] }; response_deadline: { seconds: number } | null };

export default function ResponderDisputaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [response, setResponse] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "disputes"), where("order_id", "==", id), where("status", "==", "open"));
    return onSnapshot(q, (snap) => setDispute(snap.empty ? null : ({ dispute_id: snap.docs[0].id, ...snap.docs[0].data() } as Dispute)));
  }, [id]);

  useEffect(() => {
    if (!dispute?.response_deadline) return;
    const deadlineMs = dispute.response_deadline.seconds * 1000;
    const tick = () => setRemaining(Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dispute?.response_deadline]);

  async function handleAddPhoto() {
    setUploading(true);
    const { url } = await uploadImage(`disputes/${id}`);
    setPhotos((prev) => [...prev, url]);
    setUploading(false);
  }

  async function handleSubmit() {
    if (!dispute || response.trim().length < MIN_CHARS) return;
    setSubmitting(true);
    await updateDoc(doc(db, "disputes", dispute.dispute_id), {
      cleaner_response: { description: response, photos, submitted_at: serverTimestamp() },
      status: "responded",
      updated_at: serverTimestamp(),
    });
    setSubmitting(false);
    router.replace(`/(cleaner)/agenda`);
  }

  if (!dispute) {
    return (
      <View style={styles.center}>
        <Spinner label="Carregando disputa..." />
      </View>
    );
  }

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const valid = response.trim().length >= MIN_CHARS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Responder disputa</Text>
      <View style={styles.countdownBox}>
        <Text style={styles.countdownText}>Você tem {h}h {m}min para responder</Text>
      </View>

      <View style={styles.claimBox}>
        <Text style={styles.claimTitle}>Alegação do cliente</Text>
        <Text style={styles.claimText}>{dispute.client_claim.description}</Text>
        {dispute.client_claim.photos.length > 0 && (
          <View style={styles.photoRow}>
            {dispute.client_claim.photos.map((_, i) => (
              <View key={i} style={styles.photoThumb}>
                <Icon name="image" size={20} color={C.textSecondary} />
              </View>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.label}>Sua resposta</Text>
      <Input multiline numberOfLines={5} placeholder="Descreva o que aconteceu com o máximo de detalhes (mínimo 50 caracteres)" value={response} onChangeText={setResponse} style={styles.textarea} />
      <Text style={[styles.charCount, { color: valid ? C.textSecondary : C.error }]}>{response.length}/{MIN_CHARS}</Text>

      <View style={styles.photoRow}>
        {photos.map((_, i) => (
          <View key={i} style={[styles.photoSlot, styles.photoFilled]}>
            <Text style={styles.photoFilledText}>Foto</Text>
          </View>
        ))}
        {photos.length < 3 && (
          <Pressable style={styles.photoSlot} onPress={handleAddPhoto} disabled={uploading}>
            {uploading ? <Spinner size="small" /> : <Icon name="camera" size={20} color={C.textSecondary} />}
          </Pressable>
        )}
      </View>

      <Button variant="primary" size="large" disabled={!valid} loading={submitting} onPress={handleSubmit} style={{ marginTop: space.xl }}>
        Enviar resposta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  countdownBox: { alignSelf: "flex-start", marginTop: space.s, paddingVertical: space.s, paddingHorizontal: space.l, backgroundColor: C.errorBg, borderRadius: 8 },
  countdownText: { fontFamily: font.medium, fontSize: font.body, color: C.error },
  claimBox: { backgroundColor: C.surface, borderRadius: radius.l, padding: space.l, marginTop: space.l },
  claimTitle: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginBottom: space.s },
  claimText: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280", lineHeight: 20 },
  label: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginTop: space.l, marginBottom: space.s },
  textarea: { height: 100, textAlignVertical: "top" },
  charCount: { fontFamily: font.regular, fontSize: font.caption, textAlign: "right", marginTop: 4 },
  photoRow: { flexDirection: "row", gap: space.s, marginTop: space.m },
  photoThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: C.border, alignItems: "center", justifyContent: "center" },
  photoSlot: { width: 72, height: 72, borderRadius: radius.l, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  photoFilled: { backgroundColor: C.purpleLight, borderWidth: 0 },
  photoFilledText: { fontFamily: font.medium, fontSize: font.labelSm, color: C.purplePrimary },
});
