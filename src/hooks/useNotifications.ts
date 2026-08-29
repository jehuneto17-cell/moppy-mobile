import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "@/src/services/firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    void registerForNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("📬 Notificação recebida:", notification.request.content.body);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("👆 Usuário clicou na notificação:", response.notification.request.content.body);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);
}

async function registerForNotifications() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("🔔 Token FCM registrado:", token);

    await setDoc(
      doc(db, "users", user.uid),
      {
        fcm_token: token,
        fcm_token_updated_at: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("❌ Erro ao registrar notificações:", error);
  }
}
