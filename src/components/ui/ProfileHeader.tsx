import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { C, font, space } from "@/src/theme";

export function ProfileHeader({
  name,
  email,
  subtitle,
}: {
  name?: string;
  email?: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.container}>
      <Avatar name={name} size="xlarge" />
      <Text style={styles.name}>{name || "Usuário"}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 2, marginBottom: space.xxl },
  name: { fontFamily: font.bold, fontSize: font.h2, color: C.textMaximum, marginTop: space.m },
  email: { fontFamily: font.regular, fontSize: font.bodySm, color: C.textSecondary },
  subtitle: { fontFamily: font.medium, fontSize: font.bodySm, color: C.purplePrimary, marginTop: 4 },
});
