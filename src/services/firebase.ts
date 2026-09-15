import AsyncStorage from "@react-native-async-storage/async-storage";
// A versão instalada de "firebase/auth" não exporta getReactNativePersistence
// no build que o Metro resolve pro nativo — só o pacote interno @firebase/auth
// tem, e só no arquivo de tipos da variante RN (que o tsc não enxerga aqui).
// @ts-expect-error - existe em dist/rn/index.rn.d.ts, fora do types default do pacote
import { getReactNativePersistence } from "@firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth, initializeAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { Platform } from "react-native";

const firebaseConfig = {
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// No web o SDK já persiste a sessão sozinho (localStorage). No nativo, sem
// isso a sessão fica só em memória e some toda vez que o app é reaberto —
// por isso pedia login de novo sempre. O try/catch cobre o Fast Refresh, que
// reavalia este módulo e chamaria initializeAuth de novo no mesmo app.
function createAuth() {
  if (Platform.OS === "web") return getAuth(app);
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);

if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
