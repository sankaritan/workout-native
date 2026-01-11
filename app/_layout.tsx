import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from "@expo-google-fonts/lexend";
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";
import { initStorage } from "@/lib/storage/storage";
import { seedExercises, seedTestWorkoutPlan } from "@/lib/storage/seed-data";

import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [storageReady, setStorageReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Initialize storage (works on both web and mobile)
  useEffect(() => {
    async function setupStorage() {
      try {
        console.log("Initializing storage...");
        await initStorage();
        seedExercises();
        seedTestWorkoutPlan();
        setStorageReady(true);
        console.log("Storage initialized successfully");
      } catch (error) {
        console.error("Failed to initialize storage:", error);
        // Still set ready so the app can render (workout features just won't work)
        setStorageReady(true);
      }
    }
    setupStorage();
  }, []);

  useEffect(() => {
    if (fontsLoaded && storageReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, storageReady]);

  if (!fontsLoaded || !storageReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#102218" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="wizard" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
