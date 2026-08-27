import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import { useCleanerProfile } from "@/src/hooks/useCleanerProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { C, font, space } from "@/src/theme";

export default function SplashScreen() {
  const { user, initializing } = useAuth();
  const { role, loading: profileLoading } = useUserProfile(user?.uid ?? null);
  const isCleaner = !!role?.includes("cleaner");
  const { profile: cleanerProfile, loading: cleanerLoading } = useCleanerProfile(isCleaner ? user?.uid ?? null : null);

  if (initializing || (user && profileLoading) || (isCleaner && cleanerLoading)) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>Moppy</Text>
        <ActivityIndicator color="#fff" style={{ marginTop: space.xxxl }} />
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (!role || role.length === 0) return <Redirect href="/(role-choice)" />;

  if (isCleaner) {
    if (!cleanerProfile) return <Redirect href="/(cleaner-onboarding)/documentos" />;
    if (cleanerProfile.approval_status !== "approved") return <Redirect href="/(cleaner-onboarding)/aguardando" />;
    return <Redirect href="/(cleaner)/buscar" />;
  }

  return <Redirect href="/(client)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.purplePrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontFamily: font.bold,
    fontSize: font.h1,
    color: "#fff",
  },
  version: {
    position: "absolute",
    bottom: 40,
    fontFamily: font.regular,
    fontSize: font.caption,
    color: "rgba(255,255,255,0.7)",
  },
});
