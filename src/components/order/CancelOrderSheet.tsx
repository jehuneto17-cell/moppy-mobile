import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { auth } from "@/src/services/firebase";
import { C, font, radius, space } from "@/src/theme";

export function CancelOrderSheet({
  orderId,
  visible,
  onClose,
  onCancelled,
}: {
  orderId: string;
  visible: boolean;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (reason.trim().length < 5) {
      setError("Descreva o motivo do cancelamento (mínimo 5 caracteres).");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/orders/${orderId}/cancel-self`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao cancelar o pedido");
      onCancelled();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao cancelar o pedido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Cancelar pedido</Text>
          <Text style={styles.subtitle}>
            Se faltar menos de 12h para o horário combinado, uma parte do valor pode ser retida como compensação pela faxineira.
          </Text>
          <Input
            multiline
            numberOfLines={3}
            placeholder="Por que você quer cancelar?"
            value={reason}
            onChangeText={setReason}
            style={styles.textarea}
          />
          {error && (
            <View style={{ marginTop: space.m }}>
              <Alert variant="error">{error}</Alert>
            </View>
          )}
          <View style={styles.buttonRow}>
            <Button variant="secondary" style={{ flex: 1 }} onPress={onClose}>
              Voltar
            </Button>
            <Button variant="danger" style={{ flex: 1 }} loading={submitting} onPress={handleConfirm}>
              Confirmar cancelamento
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "#1F2937AA", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xxl, alignItems: "center" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: space.l },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum },
  subtitle: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary, textAlign: "center", marginTop: space.s, lineHeight: 19 },
  textarea: { height: 80, textAlignVertical: "top", width: "100%", marginTop: space.l },
  buttonRow: { flexDirection: "row", gap: space.s, marginTop: space.l, width: "100%" },
});
