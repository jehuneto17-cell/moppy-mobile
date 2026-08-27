import { Tabs } from "expo-router";

import { Icon } from "@/src/components/ui/Icon";
import { C } from "@/src/theme";

export default function ClientTabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: C.purplePrimary, headerShown: false }}>
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
    </Tabs>
  );
}
