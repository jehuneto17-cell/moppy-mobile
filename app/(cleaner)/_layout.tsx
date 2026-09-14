import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon";
import { useRoleGuard } from "@/src/hooks/useRoleGuard";
import { C, font } from "@/src/theme";

export default function CleanerTabsLayout() {
  const { ready, redirect } = useRoleGuard("cleaner");

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
        name="buscar"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => <Icon name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="carteira"
        options={{
          title: "Carteira",
          tabBarIcon: ({ color, size }) => <Icon name="credit-card" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="pedido/[id]" options={{ href: null }} />
      <Tabs.Screen name="candidatura-resultado" options={{ href: null }} />
      <Tabs.Screen name="solicitar-saque" options={{ href: null }} />
      <Tabs.Screen name="historico" options={{ href: null }} />
    </Tabs>
  );
}
