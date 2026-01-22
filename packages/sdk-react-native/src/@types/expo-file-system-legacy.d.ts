/**
 * Type declarations for expo-file-system/legacy subpath.
 *
 * In expo-file-system v19 (SDK 54), the legacy API containing
 * createUploadTask() was moved to a separate subpath.
 *
 * This declaration enables TypeScript to resolve the import.
 */
declare module "expo-file-system/legacy" {
  // Re-export types from the build output
  export * from "expo-file-system/build/legacy/FileSystem";
  export * from "expo-file-system/build/legacy/FileSystem.types";
}
