# Harken React Native SDK

React Native / Expo SDK for submitting in-app feedback.

## Installation

```bash
npx expo install @harkenapp/sdk-react-native
```

## Permissions

The SDK requires camera and photo library permissions to support attachment features. The SDK includes an Expo config plugin that automatically configures these permissions.

### Automatic Configuration (Recommended)

Add the SDK to your `app.json` or `app.config.js` plugins:

```json
{
  "expo": {
    "plugins": ["@harkenapp/sdk-react-native"]
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
      [
        "@harkenapp/sdk-react-native",
        {
          "cameraPermission": "Take photos to include with your feedback",
          "photoLibraryPermission": "Select photos to include with your feedback"
        }
      ]
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

## Web Platform

The SDK auto-detects `"ios"` and `"android"` platforms. When using React Native Web or integrating from a web app, pass `platform: "web"` in the metadata:

```tsx
await submitFeedback({
  message: "Feedback from web",
  category: "idea",
  metadata: { platform: "web" },
});
```

## Development

See the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup.

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Building

```bash
# Regenerate OpenAPI types and build
pnpm build
```

## Versioning

This package follows [Semantic Versioning](https://semver.org/). Releases are automated via GitHub Actions when changes are merged to `main`.

Current version: See [package.json](./package.json)

## License

Apache-2.0
