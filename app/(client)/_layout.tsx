import { Tabs } from "expo-router";

import { Icon } from "@/src/components/ui/Icon";
import { C, font } from "@/src/theme";

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.purplePrimary,
        headerShown: false,
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
