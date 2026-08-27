import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Alert } from "@/src/components/ui/Alert";
import { Button } from "@/src/components/ui/Button";
import { Icon } from "@/src/components/ui/Icon";
import { Spinner } from "@/src/components/ui/Spinner";
import { useAuth } from "@/src/hooks/useAuth";
import { useCleanerProfile } from "@/src/hooks/useCleanerProfile";
import { C, font, radius, space } from "@/src/theme";

const CHECKLIST: { key: "id_document" | "cpf_document" | "selfie" | "address_proof"; label: string }[] = [
  { key: "id_document", label: "RG validado" },
  { key: "cpf_document", label: "CPF validado" },
  { key: "selfie", label: "Selfie aprovada" },
  { key: "address_proof", label: "Comprovante verificado" },
];

export default function AguardandoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useCleanerProfile(user?.uid ?? null);

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const isApproved = profile.approval_status === "approved";
  const isRejected = profile.approval_status === "rejected" || profile.approval_status === "rejected_can_retry";

  const iconBg = isApproved ? C.successBg : isRejected ? C.errorBg : C.warningBg;
  const title = isApproved
    ? "Parabéns! Você está pronto para trabalhar."
    : isRejected
    ? "Sua candidatura foi rejeitada"
    : "Seu cadastro está em análise";
  const description = isApproved
    ? "Seu cadastro foi aprovado. Agora você já pode buscar seus primeiros pedidos."
    : isRejected
    ? "Revise as informações abaixo e envie novamente."
    : "Pode levar até 48h. Avisaremos por notificação assim que terminar.";

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Icon
          name={isApproved ? "check-circle" : isRejected ? "x" : "alert-circle"}
          size={44}
          color={isApproved ? C.success : isRejected ? C.error : C.warning}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {!isApproved && !isRejected && (
        <View style={{ width: "100%", marginTop: space.xxl, gap: space.m }}>
          {CHECKLIST.map((item) => {
            const done = !!profile.documents?.[item.key];
            return (
              <View key={item.key} style={styles.checklistRow}>
                {done ? <Icon name="check-circle" size={20} color={C.success} /> : <View style={styles.checklistCircle} />}
                <Text style={[styles.checklistLabel, { color: done ? C.textMaximum : C.textSecondary }]}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      {isRejected && (
        <View style={{ width: "100%", marginTop: space.xl }}>
          <Alert variant="error">{profile.approval_rejection_reason ?? "Documento ilegível."}</Alert>
        </View>
      )}

      {isApproved && (
        <Button variant="primary" size="large" onPress={() => router.replace("/(cleaner)/buscar")} style={{ width: "100%", marginTop: space.xxl }}>
          Começar agora
        </Button>
      )}
      {isRejected && (
        <Button variant="primary" size="large" onPress={() => router.replace("/(cleaner-onboarding)/documentos")} style={{ width: "100%", marginTop: space.xxl }}>
          Tentar novamente
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white, alignItems: "center", padding: space.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconCircle: { width: 96, height: 96, borderRadius: 9999, alignItems: "center", justifyContent: "center", marginTop: space.xxxl },
  title: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, textAlign: "center", marginTop: space.xxl },
  description: { fontFamily: font.regular, fontSize: font.body, color: "#6B7280", textAlign: "center", marginTop: space.s, lineHeight: 21 },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: space.m, padding: space.m, borderWidth: 1, borderColor: C.border, borderRadius: radius.l },
  checklistCircle: { width: 20, height: 20, borderRadius: 9999, borderWidth: 2, borderColor: "#D1D5DB" },
  checklistLabel: { fontFamily: font.regular, fontSize: font.body },
});
