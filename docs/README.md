# Harken Documentation

Harken is a mobile-first feedback SDK for React Native and Expo applications. It provides a simple way to collect in-app feedback from your users.

## Quick Links

- [Getting Started](./getting-started.md) - Installation and basic setup
- [Theming](./theming.md) - Customize colors, typography, and styling
- [Attachments](./attachments.md) - Enable photo and file attachments
- [API Reference](./api-reference.md) - Complete SDK reference

## Overview

Harken consists of:

- **[@harken/sdk-react-native](../packages/sdk-react-native)** - The React Native SDK
- **[@harken/contracts](../packages/contracts)** - Shared TypeScript types

## Features

- **Simple Integration** - Wrap your app with `HarkenProvider`, use the `FeedbackSheet` component
- **Pseudonymous by Default** - No user PII required; anonymous IDs are stable per device
- **Attachments** - Users can attach photos (camera or library) and documents
- **Theming** - Full control over colors, typography, spacing, and dark mode
- **Offline Support** - Uploads queue and retry automatically
- **Expo Compatible** - Works with Expo managed workflow (no native modules required)

## Minimal Example

```tsx
import { HarkenProvider, FeedbackSheet } from '@harken/sdk-react-native';

export default function App() {
  return (
    <HarkenProvider config={{ publishableKey: 'pk_live_your_key' }}>
      <YourApp />
      <FeedbackSheet />
    </HarkenProvider>
  );
}
```

## Getting Help

- [GitHub Issues](https://github.com/thutch-conecrow/harken/issues) - Bug reports and feature requests
- [Example App](../examples/expo-basic) - Working example with all features

## License

Apache 2.0 - See [LICENSE](../LICENSE) for details.
