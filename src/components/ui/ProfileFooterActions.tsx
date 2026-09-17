import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { C, font, radius, shadowCard, space } from "@/src/theme";

type DialogState = { title: string; message: string; onConfirm?: () => void } | null;

export function ProfileFooterActions({ onLogout }: { onLogout: () => void }) {
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <View style={styles.box}>
      <Pressable
        style={styles.row}
        onPress={() => setDialog({ title: "Sair da conta", message: "Tem certeza que deseja sair?", onConfirm: onLogout })}
      >
        <Icon name="log-out" size={18} color={C.textMaximum} />
        <Text style={styles.rowText}>Sair</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        style={styles.row}
        onPress={() =>
          setDialog({ title: "Excluir conta", message: "Essa opção ainda não está disponível por aqui. Fale com o suporte do Moppy pra excluir sua conta." })
        }
      >
        <Icon name="trash-2" size={18} color={C.error} />
        <Text style={[styles.rowText, { color: C.error }]}>Excluir conta</Text>
      </Pressable>

      <Modal visible={!!dialog} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
        <Pressable style={modalStyles.overlay} onPress={() => setDialog(null)}>
          <Pressable style={modalStyles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={modalStyles.title}>{dialog?.title}</Text>
            <Text style={modalStyles.message}>{dialog?.message}</Text>
            <View style={modalStyles.buttonRow}>
              {dialog?.onConfirm ? (
                <>
                  <Pressable style={modalStyles.buttonSecondary} onPress={() => setDialog(null)}>
                    <Text style={modalStyles.buttonSecondaryText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={modalStyles.buttonDanger}
                    onPress={() => {
                      dialog?.onConfirm?.();
                      setDialog(null);
                    }}
                  >
                    <Text style={modalStyles.buttonDangerText}>Sair</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable style={modalStyles.buttonPrimary} onPress={() => setDialog(null)}>
                  <Text style={modalStyles.buttonPrimaryText}>OK</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#fff", borderRadius: radius.l, ...shadowCard, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: space.m, padding: space.l },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: space.l },
  rowText: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: space.xxl },
  card: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: radius.l, padding: space.xl },
  title: { fontFamily: font.bold, fontSize: font.h3, color: C.textMaximum, marginBottom: space.s },
  message: { fontFamily: font.regular, fontSize: font.body, color: C.textSecondary, lineHeight: 21 },
  buttonRow: { flexDirection: "row", gap: space.s, marginTop: space.xl },
  buttonSecondary: { flex: 1, paddingVertical: space.m, borderRadius: radius.m, alignItems: "center", backgroundColor: C.surface },
  buttonSecondaryText: { fontFamily: font.medium, fontSize: font.body, color: C.textMaximum },
  buttonDanger: { flex: 1, paddingVertical: space.m, borderRadius: radius.m, alignItems: "center", backgroundColor: C.error },
  buttonDangerText: { fontFamily: font.medium, fontSize: font.body, color: "#fff" },
  buttonPrimary: { flex: 1, paddingVertical: space.m, borderRadius: radius.m, alignItems: "center", backgroundColor: C.purplePrimary },
  buttonPrimaryText: { fontFamily: font.medium, fontSize: font.body, color: "#fff" },
});
