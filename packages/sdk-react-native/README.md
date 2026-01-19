# Harken React Native SDK

React Native / Expo SDK for submitting in-app feedback.

## Installation

```bash
npx expo install @harken/sdk-react-native
```

## Permissions

The SDK requires camera and photo library permissions to support attachment features. The SDK includes an Expo config plugin that automatically configures these permissions.

### Automatic Configuration (Recommended)

Add the SDK to your `app.json` or `app.config.js` plugins:

```json
{
  "expo": {
    "plugins": [
      "@harken/sdk-react-native"
    ]
  }
}
```

This automatically configures:

**iOS (Info.plist):**
- `NSCameraUsageDescription` - Camera access for taking photos
- `NSPhotoLibraryUsageDescription` - Photo library access for selecting images

> **Note:** `NSDocumentsFolderUsageDescription` is not required. The SDK uses `expo-document-picker` which presents the system document picker UI, handling file access permissions automatically without needing an Info.plist entry.

**Android (AndroidManifest.xml):**
- `android.permission.CAMERA` - Camera access
- `android.permission.READ_MEDIA_IMAGES` - Photo library access (Android 13+)
- `android.permission.READ_EXTERNAL_STORAGE` - Photo library access (Android 12 and below)

### Custom Permission Strings

You can customize the iOS permission dialog strings:

```json
{
  "expo": {
    "plugins": [
      ["@harken/sdk-react-native", {
        "cameraPermission": "Take photos to include with your feedback",
        "photoLibraryPermission": "Select photos to include with your feedback"
      }]
    ]
  }
}
```

### After Configuration

Run prebuild to apply the permissions:

```bash
npx expo prebuild
```

Or if using EAS Build, permissions are applied automatically during the build process.
