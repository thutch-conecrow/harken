# Harken Expo Example

A complete example demonstrating the Harken React Native SDK in an Expo application.

## Features Demonstrated

- **HarkenProvider** setup with secure storage
- **Category selection** using `CategorySelector`
- **Themed UI components** (`ThemedText`, `ThemedTextInput`, `ThemedButton`)
- **Attachment uploads** with `useAttachmentUpload` hook
- **Platform-native picker** (`AttachmentPicker` - ActionSheet on iOS, bottom sheet on Android)
- **Upload progress tracking** with `AttachmentGrid` and `UploadStatusOverlay`
- **Background uploads** that continue after app backgrounding
- **Feedback submission** with `useFeedback` hook

## Prerequisites

- Node.js 18+
- pnpm
- iOS Simulator or Android Emulator (or physical device)
- Expo Go app (for quick testing) or development build

## Setup

1. **Install dependencies** from the monorepo root:

   ```bash
   cd /path/to/harken/public
   pnpm install
   ```

2. **Build the SDK** (if not already built):

   ```bash
   pnpm --filter @harkenapp/sdk-react-native build
   ```

3. **Start the example**:

   ```bash
   cd examples/expo-basic
   pnpm start
   ```

4. **Run on device/simulator**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go for physical device

## Configuration

### Publishable Key

Replace the placeholder key in `App.tsx`:

```tsx
<HarkenProvider
  config={{
    publishableKey: 'pk_live_your_actual_key',
  }}
>
```

Get your publishable key from the [Harken Console](https://console.harken.app).

### Verified User Identity (Optional)

For verified user identity, pass a token signed by your backend:

```tsx
<HarkenProvider
  config={{
    publishableKey: 'pk_live_xxx',
    userToken: tokenFromYourBackend, // JWT signed with your secret key
  }}
>
```

### Theme Customization

Override default theme colors:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  themeMode="system"
  lightTheme={{
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
    },
  }}
  darkTheme={{
    colors: {
      primary: '#0A84FF',
      background: '#000000',
    },
  }}
>
```

## Project Structure

```
expo-basic/
├── App.tsx            # Main app with HarkenProvider and feedback form
├── app.json           # Expo configuration
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript configuration
├── babel.config.js    # Babel configuration for Expo
└── assets/            # App icons and splash screen
```

## Key SDK Imports

```tsx
import {
  // Provider
  HarkenProvider,
  createSecureStoreAdapter,

  // Hooks
  useHarkenTheme,
  useFeedback,
  useAttachmentUpload,

  // Components
  ThemedText,
  ThemedTextInput,
  ThemedButton,
  CategorySelector,
  AttachmentPicker,
  AttachmentGrid,
  UploadStatusOverlay,

  // Constants
  DEFAULT_CATEGORIES,
  UploadPhase,
} from '@harkenapp/sdk-react-native';
```

## Development Build

For full functionality (especially camera access), create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Create development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

## Troubleshooting

### Camera/Photo Library not working in Expo Go

Some features require a development build. Create one with EAS Build or run locally:

```bash
npx expo run:ios
# or
npx expo run:android
```

### Attachments not uploading

1. Check that your publishable key is valid
2. Ensure the device has network connectivity
3. Check the debug console for error messages (enable `debug: true` in config)

### TypeScript errors

Run typecheck to see any type issues:

```bash
pnpm typecheck
```
