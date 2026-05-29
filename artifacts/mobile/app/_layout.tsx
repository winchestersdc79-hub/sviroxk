import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

// Must be called at top level, before any component mounts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient();

async function setupNotifications() {
  if (Platform.OS === "web") return;

  // Set up Android notification channel (required for Android 8+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Sviroxk — Уведомления",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#A855F7",
      sound: "default",
      showBadge: true,
    });
    await Notifications.setNotificationChannelAsync("deadlines", {
      name: "Дедлайны задач",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: "#EF4444",
      sound: "default",
    });
    await Notifications.setNotificationChannelAsync("habits", {
      name: "Напоминания о привычках",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
    await Notifications.setNotificationChannelAsync("pomodoro", {
      name: "Pomodoro таймер",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  // Check current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return;

  // Show explanation dialog first (best practice)
  if (Platform.OS === "ios") {
    await new Promise<void>((resolve) => {
      Alert.alert(
        "Разрешить уведомления?",
        "Sviroxk отправляет напоминания о задачах с дедлайнами, привычках и окончании Pomodoro-сессий.",
        [
          { text: "Не сейчас", style: "cancel", onPress: resolve },
          {
            text: "Разрешить",
            onPress: async () => {
              await Notifications.requestPermissionsAsync({
                ios: {
                  allowAlert: true,
                  allowBadge: true,
                  allowSound: true,
                  allowAnnouncements: true,
                },
              });
              resolve();
            },
          },
        ]
      );
    });
  } else {
    // Android: request directly (system shows its own dialog)
    await Notifications.requestPermissionsAsync();
  }
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="quadrant/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="archive" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Setup notifications after app is ready
      setupNotifications().catch(console.warn);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
