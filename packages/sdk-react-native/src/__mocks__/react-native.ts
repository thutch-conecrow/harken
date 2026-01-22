/**
 * Mock React Native module for testing.
 *
 * Provides minimal mocks for modules used by the SDK.
 */

export const Platform = {
  OS: "ios" as "ios" | "android" | "web" | "windows" | "macos",
  select: <T>(options: { ios?: T; android?: T; default?: T }): T | undefined => {
    return options.ios ?? options.default;
  },
  Version: "17.0",
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: <T>(style: T | T[]): T => (Array.isArray(style) ? Object.assign({}, ...style) : style),
};

export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const View = "View";
export const Text = "Text";
export const TouchableOpacity = "TouchableOpacity";
export const TextInput = "TextInput";
export const ScrollView = "ScrollView";
export const ActivityIndicator = "ActivityIndicator";
export const Image = "Image";
export const Pressable = "Pressable";

export default {
  Platform,
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Pressable,
};
