import "./global.css";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { HarkenProvider, FeedbackSheet } from "@harkenapp/sdk-react-native";
import type { PartialHarkenTheme } from "@harkenapp/sdk-react-native";

// Theme customization using Tailwind color palette
// This demonstrates how to match Harken's theme to your Tailwind design system
const tailwindTheme: PartialHarkenTheme = {
  colors: {
    // Map to Tailwind's indigo palette for primary
    primary: "#6366f1", // indigo-500
    primaryPressed: "#4f46e5", // indigo-600
    textOnPrimary: "#ffffff",

    // Map to Tailwind's slate palette for neutrals
    background: "#0f172a", // slate-900
    surface: "#1e293b", // slate-800
    text: "#f8fafc", // slate-50
    textSecondary: "#94a3b8", // slate-400
    textPlaceholder: "#64748b", // slate-500
    border: "#334155", // slate-700
    borderFocused: "#6366f1", // indigo-500

    // Semantic colors from Tailwind
    error: "#ef4444", // red-500
    success: "#22c55e", // green-500
    warning: "#f59e0b", // amber-500
  },
  typography: {
    // Match your app's font if using custom fonts
    fontFamily: "System",
    // Button text matching Tailwind's text-base font-semibold
    buttonTextSize: 16,
    buttonTextWeight: "600",
  },
  spacing: {
    // Tailwind-style spacing (base-4 scale)
    buttonPaddingVertical: 12, // py-3
    buttonPaddingHorizontal: 24, // px-6
  },
  radii: {
    // Tailwind's rounded-xl
    button: 12,
    input: 12,
    chip: 9999, // rounded-full for chips
  },
  sizing: {
    buttonMinHeight: 48,
  },
};

export default function App() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <SafeAreaProvider>
      <HarkenProvider
        config={{
          // Replace with your publishable key
          publishableKey: "pk_test_example",
          debug: true,
        }}
        themeMode="dark"
        darkTheme={tailwindTheme}
      >
        <SafeAreaView className="flex-1 bg-slate-900">
          <StatusBar style="light" />

          {showFeedback ? (
            // Harken FeedbackSheet - works seamlessly with NativeWind
            <FeedbackSheet
              onSuccess={() => {
                console.log("Feedback submitted!");
                setShowFeedback(false);
              }}
              onCancel={() => setShowFeedback(false)}
              title="Send Feedback"
              placeholder="Tell us what you think..."
            />
          ) : (
            // App UI using NativeWind/Tailwind classes
            <View className="flex-1 justify-center items-center px-6">
              <Text className="text-3xl font-bold text-slate-50 mb-2">Harken + NativeWind</Text>
              <Text className="text-base text-slate-400 text-center mb-8">
                This example demonstrates the Harken SDK working alongside NativeWind 4.x styling.
              </Text>

              <Pressable
                onPress={() => setShowFeedback(true)}
                className="bg-indigo-500 active:bg-indigo-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">Open Feedback</Text>
              </Pressable>

              <View className="mt-12 p-4 bg-slate-800 rounded-xl">
                <Text className="text-sm text-slate-300 text-center">
                  The app UI uses NativeWind (className).{"\n"}
                  Harken components use traditional StyleSheet.{"\n"}
                  Both work together without conflict.
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </HarkenProvider>
    </SafeAreaProvider>
  );
}
