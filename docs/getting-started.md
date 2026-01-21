# Getting Started

This guide will help you integrate Harken into your React Native or Expo application.

## Prerequisites

- React Native 0.72+ or Expo SDK 54+
- A Harken account with an app created ([sign up here](https://harken.app))

## Installation

```bash
# Using npm
npm install @harkenapp/sdk-react-native

# Using pnpm
pnpm add @harkenapp/sdk-react-native

# Using Expo
npx expo install @harkenapp/sdk-react-native
```

### Peer Dependencies

The SDK requires these peer dependencies (Expo projects typically have these already):

```bash
npx expo install expo-secure-store expo-file-system expo-image-picker expo-document-picker @react-native-async-storage/async-storage @react-native-community/netinfo
```

## Permissions Setup

The SDK includes an Expo config plugin that automatically configures camera and photo library permissions.

Add it to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "@harkenapp/sdk-react-native"
    ]
  }
}
```

Then run prebuild:

```bash
npx expo prebuild
```

### Custom Permission Strings

Customize the iOS permission dialog text:

```json
{
  "expo": {
    "plugins": [
      ["@harkenapp/sdk-react-native", {
        "cameraPermission": "Take photos to include with your feedback",
        "photoLibraryPermission": "Select photos to include with your feedback"
      }]
    ]
  }
}
```

## Basic Setup

### 1. Wrap Your App with HarkenProvider

```tsx
import { HarkenProvider } from '@harkenapp/sdk-react-native';

export default function App() {
  return (
    <HarkenProvider
      config={{
        publishableKey: 'pk_live_your_key_here',
      }}
    >
      <YourApp />
    </HarkenProvider>
  );
}
```

Get your publishable key from the [Harken Console](https://console.harken.app).

### 2. Add the Feedback Form

The simplest way to collect feedback is with the `FeedbackSheet` component:

```tsx
import { FeedbackSheet } from '@harkenapp/sdk-react-native';

function FeedbackScreen() {
  return (
    <FeedbackSheet
      onSuccess={() => {
        // Navigate back or show success state
        navigation.goBack();
      }}
      onCancel={() => {
        navigation.goBack();
      }}
    />
  );
}
```

That's it! Users can now submit feedback with optional category selection and file attachments.

## Configuration Options

### HarkenProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config.publishableKey` | `string` | Required | Your app's publishable API key |
| `config.userToken` | `string` | - | Optional verified user identity token |
| `config.apiBaseUrl` | `string` | `'https://api.harken.app'` | API base URL (for self-hosting) |
| `config.debug` | `boolean` | `false` | Enable debug logging |
| `themeMode` | `'light' \| 'dark' \| 'system'` | `'system'` | Theme mode |
| `lightTheme` | `PartialHarkenTheme` | - | Light theme overrides |
| `darkTheme` | `PartialHarkenTheme` | - | Dark theme overrides |
| `storage` | `SecureStorage` | Auto-detected | Custom storage implementation |

### FeedbackSheet Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `(result) => void` | - | Called on successful submission |
| `onError` | `(error) => void` | - | Called on submission failure |
| `onCancel` | `() => void` | - | Called when user cancels (shows cancel button) |
| `title` | `string` | `'Send Feedback'` | Form title |
| `placeholder` | `string` | `'What would you like to share?'` | Message placeholder |
| `submitLabel` | `string` | `'Submit'` | Submit button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `categories` | `CategoryOption[]` | Default categories | Custom category options |
| `requireCategory` | `boolean` | `false` | Require category selection |
| `minMessageLength` | `number` | `1` | Minimum message length |
| `maxMessageLength` | `number` | `5000` | Maximum message length |
| `enableAttachments` | `boolean` | `true` | Enable file attachments |
| `maxAttachments` | `number` | `5` | Maximum attachments allowed |
| `attachmentSources` | `object` | All enabled | Configure attachment sources |
| `showSuccessAlert` | `boolean` | `true` | Show success alert |
| `clearOnSuccess` | `boolean` | `true` | Clear form after success |

## Verified User Identity (Optional)

By default, Harken uses anonymous device IDs. For verified user identity (to group feedback by user), your backend signs a token:

```tsx
// Your backend generates this token
const userToken = await fetchUserTokenFromYourBackend();

<HarkenProvider
  config={{
    publishableKey: 'pk_live_xxx',
    userToken, // JWT signed with your secret key
  }}
>
```

See your Harken Console for documentation on generating user tokens.

## Custom Integration

If you need more control than `FeedbackSheet` provides, use the hooks directly:

```tsx
import {
  useFeedback,
  useAttachmentUpload,
  ThemedText,
  ThemedTextInput,
  ThemedButton,
  CategorySelector,
  AttachmentPicker,
  AttachmentGrid,
} from '@harkenapp/sdk-react-native';

function CustomFeedbackForm() {
  const { submitFeedback, isSubmitting } = useFeedback();
  const { attachments, getAttachmentIds } = useAttachmentUpload();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState(null);

  const handleSubmit = async () => {
    await submitFeedback({
      message,
      category: category ?? 'other',
      attachments: getAttachmentIds(),
    });
  };

  return (
    <View>
      <CategorySelector value={category} onChange={setCategory} />
      <ThemedTextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Your feedback..."
        multiline
      />
      <AttachmentGrid attachments={attachments} />
      <ThemedButton
        title="Submit"
        onPress={handleSubmit}
        loading={isSubmitting}
      />
    </View>
  );
}
```

## Next Steps

- [Theming](./theming.md) - Customize colors, typography, and styling
- [Attachments](./attachments.md) - Deep dive into attachment handling
- [API Reference](./api-reference.md) - Complete SDK reference
