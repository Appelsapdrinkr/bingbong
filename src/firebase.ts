import { initializeApp, getApps, getApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FirebaseAuth from "@firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Missing Firebase config: ${missingConfig.join(", ")}. Add EXPO_PUBLIC_FIREBASE_* values in your environment.`,
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    const {
      browserLocalPersistence,
      initializeAuth,
    } = FirebaseAuth;

    const persistence =
      Platform.OS === "web"
        ? browserLocalPersistence
        : (FirebaseAuth as {
            getReactNativePersistence?: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
          }).getReactNativePersistence?.(AsyncStorage);

    if (!persistence) {
      throw new Error("React Native auth persistence is unavailable in this build.");
    }

    return initializeAuth(app, { persistence });
  } catch {
    return FirebaseAuth.getAuth(app);
  }
})();

export const db = getFirestore(app);
