import {
  seedExercises,
  seedMockWorkoutHistory,
  seedTestWorkoutPlan,
} from "@/lib/storage/seed-data";
import { initStorage } from "@/lib/storage/storage";
import {
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  useFonts,
} from "@expo-google-fonts/lexend";
import {
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
} from "@expo-google-fonts/noto-sans";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
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
    ...MaterialIcons.font,
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
        seedMockWorkoutHistory();
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
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#102218" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="wizard"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
