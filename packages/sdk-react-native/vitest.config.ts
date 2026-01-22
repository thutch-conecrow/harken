import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      // Mock React Native modules - must use path.resolve for correct resolution
      "react-native": path.resolve(__dirname, "src/__mocks__/react-native.ts"),
      "expo-secure-store": path.resolve(__dirname, "src/__mocks__/expo-secure-store.ts"),
      "expo-image-picker": path.resolve(__dirname, "src/__mocks__/expo-image-picker.ts"),
      "expo-document-picker": path.resolve(__dirname, "src/__mocks__/expo-document-picker.ts"),
      "expo-file-system/legacy": path.resolve(__dirname, "src/__mocks__/expo-file-system.ts"),
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "src/__mocks__/async-storage.ts"
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/types/**",
        "src/@types/**",
        "src/**/index.ts",
        "src/__mocks__/**",
      ],
    },
  },
});
