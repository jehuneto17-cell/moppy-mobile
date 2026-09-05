import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Icon } from "@/src/components/ui/Icon";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/hooks/useAuth";
import { uploadImage } from "@/src/services/cloudinary";
import { C, font, radius, space } from "@/src/theme";

const MIN_CHARS = 50;

export default function AbrirDisputaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [authorize, setAuthorize] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddPhoto(slot: number) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Precisamos de acesso às fotos pra anexar uma imagem.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (result.canceled) return;

    setUploadingSlot(slot);
    try {
      const { url } = await uploadImage(`disputes/${id}`, result.assets[0].uri);
      setPhotos((prev) => [...prev, url]);
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleSubmit() {
    if (!user || description.trim().length < MIN_CHARS) return;
    setSubmitting(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ order_id: id, description, photos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao abrir disputa");
      router.replace(`/(client)/pedido/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao abrir disputa");
    } finally {
      setSubmitting(false);
    }
  }

  const submitDisabled = description.trim().length < MIN_CHARS || submitting;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relatar problema</Text>

      <Input
        multiline
        numberOfLines={5}
        placeholder="Descreva o que aconteceu..."
        value={description}
        onChangeText={setDescription}
        style={styles.textarea}
      />
      <Text style={styles.charCount}>{description.length}/{MIN_CHARS}</Text>

      <Text style={styles.label}>Fotos (opcional)</Text>
      <View style={styles.photoRow}>
        {[0, 1, 2].map((slot) => (
          <Pressable key={slot} style={styles.photoSlot} onPress={() => handleAddPhoto(slot)} disabled={slot < photos.length || uploadingSlot !== null}>
            {slot < photos.length ? (
              <Text style={styles.photoFilled}>Foto</Text>
            ) : uploadingSlot === slot ? (
              <Text style={styles.photoFilled}>...</Text>
            ) : (
              <Icon name="camera" size={20} color={C.textSecondary} />
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: space.l }}>
        <Checkbox checked={authorize} onChange={setAuthorize} label="Autorizo a Moppy a contactar a faxineira sobre este problema" />
      </View>

      <Text style={styles.footerNote}>Sua disputa será analisada em até 48h.</Text>

      {error && <Alert variant="error">{error}</Alert>}

      <Button variant="primary" size="large" disabled={submitDisabled} loading={submitting} onPress={handleSubmit} style={{ marginTop: space.l }}>
        Abrir disputa
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginBottom: space.xl },
  textarea: { height: 100, textAlignVertical: "top" },
  charCount: { fontFamily: font.regular, fontSize: font.caption, color: C.textSecondary, textAlign: "right", marginTop: 4 },
  label: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum, marginTop: space.l, marginBottom: space.s },
  photoRow: { flexDirection: "row", gap: space.s },
  photoSlot: { flex: 1, aspectRatio: 1, borderRadius: radius.l, borderWidth: 1.5, borderColor: C.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: C.surface },
  photoFilled: { fontFamily: font.medium, fontSize: font.labelSm, color: C.purplePrimary },
  footerNote: { fontFamily: font.regular, fontSize: font.caption, color: C.textSecondary, marginTop: space.l },
});
