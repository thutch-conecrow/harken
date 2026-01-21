# Harken

Mobile-first feedback SDK for React Native and Expo applications.

Harken makes it easy to collect in-app feedback from your users. Add a feedback form to your app in minutes with full support for categories, file attachments, theming, and offline uploads.

## Features

- **Simple Integration** - Wrap with provider, drop in the form component
- **Pseudonymous by Default** - No user PII required
- **File Attachments** - Photos from camera/library, documents
- **Fully Themeable** - Colors, typography, spacing, dark mode
- **Offline Support** - Uploads queue and retry automatically
- **Expo Compatible** - Works with managed workflow

## Quick Start

```bash
npx expo install @harkenapp/sdk-react-native
```

```tsx
import { HarkenProvider, FeedbackSheet } from '@harkenapp/sdk-react-native';

export default function App() {
  return (
    <HarkenProvider config={{ publishableKey: 'pk_live_your_key' }}>
      <YourApp />
      <FeedbackSheet onSuccess={() => console.log('Submitted!')} />
    </HarkenProvider>
  );
}
```

Get your publishable key from [console.harken.app](https://console.harken.app).

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation and setup
- [Theming](./docs/theming.md) - Customize the look and feel
- [Attachments](./docs/attachments.md) - File upload handling
- [API Reference](./docs/api-reference.md) - Complete SDK reference

## Packages

| Package | Description |
|---------|-------------|
| [@harkenapp/sdk-react-native](./packages/sdk-react-native) | React Native SDK |

## Examples

See the [examples](./examples) directory for working sample apps:

- [expo-basic](./examples/expo-basic) - Complete Expo example with all features

## License

Apache 2.0 - See [LICENSE](./LICENSE) for details.
