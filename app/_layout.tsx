import {
  seedExercises,
  seedMockWorkoutHistory,
  seedTestWorkoutPlan,
} from "@/lib/storage/seed-data";
import { retryPendingStravaSyncs } from "@/lib/strava/sync";
import { initStorage } from "@/lib/storage/storage";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    Lexend_300Light: require("../assets/fonts/Lexend_300Light.ttf"),
    Lexend_400Regular: require("../assets/fonts/Lexend_400Regular.ttf"),
    Lexend_500Medium: require("../assets/fonts/Lexend_500Medium.ttf"),
    Lexend_600SemiBold: require("../assets/fonts/Lexend_600SemiBold.ttf"),
    Lexend_700Bold: require("../assets/fonts/Lexend_700Bold.ttf"),
    NotoSans_400Regular: require("../assets/fonts/NotoSans_400Regular.ttf"),
    NotoSans_500Medium: require("../assets/fonts/NotoSans_500Medium.ttf"),
    NotoSans_700Bold: require("../assets/fonts/NotoSans_700Bold.ttf"),
    MaterialIcons: require("../assets/fonts/MaterialIcons.ttf"),
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
        
        // Always seed exercises (exercise library is required)
        seedExercises();
        
        // NOTE: We no longer auto-seed test data on startup.
        // Use the Test tab in the app to manually seed or clear data.
        // seedTestWorkoutPlan();
        // seedMockWorkoutHistory();

        await retryPendingStravaSyncs();
        
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
