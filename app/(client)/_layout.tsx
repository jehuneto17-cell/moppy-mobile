import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { useRoleGuard } from "@/src/hooks/useRoleGuard";
import { C, font } from "@/src/theme";

export default function ClientTabsLayout() {
  const { ready, redirect } = useRoleGuard("client");

  if (!ready) {
    if (redirect) return <Redirect href={redirect} />;
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.white }}>
        <ActivityIndicator color={C.purplePrimary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.purplePrimary,
        headerShown: false,
        tabBarLabelPosition: "beside-icon",
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: font.caption },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="criar-pedido" options={{ href: null }} />
      <Tabs.Screen name="pedido/[id]" options={{ href: null }} />
    </Tabs>
  );
}
