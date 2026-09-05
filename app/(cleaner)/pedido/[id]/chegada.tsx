import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { db } from "@/src/services/firebase";
import { uploadImage } from "@/src/services/cloudinary";
import { C, font, radius, space } from "@/src/theme";

export default function ConfirmarChegadaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [showAlt, setShowAlt] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [validatingGps, setValidatingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  function handleDigitChange(i: number, value: string) {
    const v = value.replace(/[^0-9]/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 3) inputs.current[i + 1]?.focus();
  }

  // GPS real exigiria expo-location + lat/lng confiável no pedido (o wizard de
  // endereço não geocodifica hoje) — ponytail: mock igual ao KYC (F02), pede a
  // localização e só valida que o dispositivo respondeu. Upgrade quando C09 salvar lat/lng.
  async function handleValidateGps() {
    setValidatingGps(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));
    setValidatingGps(false);
  }

  async function handleTakeSelfie() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Precisamos de acesso à câmera pra tirar a selfie.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
    });
    if (result.canceled) return;

    setUploadingPhoto(true);
    try {
      const { url } = await uploadImage(`arrival/${id}`, result.assets[0].uri);
      setPhotoUrl(url);
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleConfirm() {
    if (!id) return;
    setConfirming(true);
    setError(null);

    if (!showAlt) {
      const code = digits.join("");
      const order = (await getDoc(doc(db, "orders", id))).data();
      if (code !== order?.arrival_code) {
        setError("Código incorreto. Confira com o cliente.");
        setConfirming(false);
        return;
      }
    } else if (!photoUrl) {
      setError("Tire a selfie pra confirmar a chegada.");
      setConfirming(false);
      return;
    }

    await updateDoc(doc(db, "orders", id), {
      status: "in_progress",
      arrived_at: serverTimestamp(),
      arrival_method: showAlt ? "gps_photo" : "code",
      updated_at: serverTimestamp(),
    });
    setConfirming(false);
    router.replace(`/(cleaner)/pedido/${id}/andamento`);
  }

  const codeFilled = digits.every((d) => d !== "");
  const buttonDisabled = confirming || (showAlt ? !photoUrl || validatingGps : !codeFilled);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar chegada</Text>

      <Text style={styles.label}>Digite o código que o cliente passou:</Text>
      <View style={styles.codeRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              inputs.current[i] = r;
            }}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            value={d}
            onChangeText={(v) => handleDigitChange(i, v)}
          />
        ))}
      </View>

      <Pressable style={styles.altToggle} onPress={() => setShowAlt(!showAlt)}>
        <Text style={styles.altToggleText}>Caminho alternativo</Text>
        <Icon name="chevron-right" size={16} color={C.warning} />
      </Pressable>

      {showAlt && (
        <View style={{ gap: space.l, marginTop: space.l }}>
          <View>
            <View style={styles.altRow}>
              <Icon name="user" size={16} color="#6B7280" />
              <Text style={styles.altLabel}>Sua localização será validada</Text>
            </View>
            <Pressable style={styles.gpsBox} onPress={handleValidateGps}>
              {validatingGps ? <Spinner size="small" label="Validando localização…" /> : <Icon name="map-pin" size={28} color={C.purplePrimary} />}
            </Pressable>
          </View>
          <View>
            <View style={styles.altRow}>
              <Icon name="camera" size={16} color="#6B7280" />
              <Text style={styles.altLabel}>Tire uma selfie no local para confirmar</Text>
            </View>
            <Pressable style={styles.photoBox} onPress={handleTakeSelfie} disabled={uploadingPhoto}>
              {uploadingPhoto ? <Spinner size="small" /> : photoUrl ? <Text style={styles.photoOk}>Selfie enviada</Text> : <Icon name="camera" size={32} color={C.textSecondary} />}
            </Pressable>
          </View>
        </View>
      )}

      {error && (
        <View style={{ marginTop: space.l }}>
          <Alert variant="error">{error}</Alert>
        </View>
      )}

      <Button variant="primary" size="large" disabled={buttonDisabled} loading={confirming} onPress={handleConfirm} style={{ marginTop: space.xxl }}>
        Confirmar chegada
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, padding: space.xxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  label: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum, marginTop: space.xl, marginBottom: space.l },
  codeRow: { flexDirection: "row", gap: space.m },
  codeInput: { width: 56, height: 64, textAlign: "center", fontFamily: font.bold, fontSize: 24, color: C.textMaximum, borderWidth: 1, borderColor: C.border, borderRadius: radius.m },
  altToggle: { flexDirection: "row", alignItems: "center", gap: space.s, marginTop: space.xl },
  altToggleText: { fontFamily: font.medium, fontSize: font.body, color: C.warning },
  altRow: { flexDirection: "row", alignItems: "center", gap: space.s, marginBottom: space.s },
  altLabel: { fontFamily: font.regular, fontSize: font.body, color: C.textMaximum },
  gpsBox: { height: 120, borderRadius: radius.l, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  photoBox: { height: 140, borderRadius: radius.l, borderWidth: 1, borderColor: C.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  photoOk: { fontFamily: font.medium, fontSize: font.body, color: C.success },
});
