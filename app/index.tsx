import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { C, font, space } from "@/src/theme";

export default function SplashScreen() {
  const { user, initializing } = useAuth();
  const { role, loading: profileLoading } = useUserProfile(user?.uid ?? null);

  if (initializing || (user && profileLoading)) {
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
  if (role.includes("cleaner")) return <Redirect href="/(cleaner)/buscar" />;
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
