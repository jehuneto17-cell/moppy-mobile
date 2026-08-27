import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui/Card";
import { Icon } from "@/src/components/ui/Icon";
import { useAuth } from "@/src/hooks/useAuth";
import { db } from "@/src/services/firebase";
import { C, font, space } from "@/src/theme";

export default function RoleChoiceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [role, setRole] = useState<"none" | "client" | "cleaner">("none");
  const [saving, setSaving] = useState(false);

  async function chooseRole(selected: "client" | "cleaner") {
    if (!user || saving) return;
    setRole(selected);
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      role: [selected],
      updated_at: serverTimestamp(),
    });
    router.replace(selected === "client" ? "/(client)/home" : "/(cleaner-onboarding)/documentos");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como você quer usar o Moppy?</Text>

      <View style={styles.cards}>
        <Card state={role === "client" ? "selected" : "normal"} onPress={() => chooseRole("client")}>
          <View style={styles.cardContent}>
            <View style={styles.iconCircle}>
              <Icon name="user" size={32} color={C.purplePrimary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Contratar Faxina</Text>
              <Text style={styles.cardDesc}>Procure faxineiras qualificadas para sua casa</Text>
            </View>
          </View>
        </Card>

        <Card state={role === "cleaner" ? "selected" : "normal"} onPress={() => chooseRole("cleaner")}>
          <View style={styles.cardContent}>
            <View style={styles.iconCircle}>
              <Icon name="hand" size={32} color={C.purplePrimary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Oferecer Faxina</Text>
              <Text style={styles.cardDesc}>Aceite trabalhos e ganhe com sua experiência</Text>
            </View>
          </View>
        </Card>
      </View>

      {saving && <ActivityIndicator color={C.purplePrimary} style={{ marginTop: space.l }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.white,
    alignItems: "center",
    padding: space.xxl,
  },
  title: {
    fontFamily: font.bold,
    fontSize: font.h2,
    color: C.textMaximum,
    textAlign: "center",
    marginTop: space.xxxxl,
    marginBottom: space.xxxl,
  },
  cards: {
    gap: space.l,
    width: "80%",
  },
  cardContent: {
    gap: space.m,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: font.bold,
    fontSize: font.h3,
    color: C.textMaximum,
  },
  cardDesc: {
    fontFamily: font.regular,
    fontSize: font.body,
    color: C.textSecondary,
    marginTop: 4,
  },
});
