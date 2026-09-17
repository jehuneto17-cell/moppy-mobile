import { Alert, Platform } from "react-native";

// Alert.alert não mostra nada no build web (react-native-web não implementa
// o dialog nativo) — cai pro window.alert do navegador nesse caso.
export function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
