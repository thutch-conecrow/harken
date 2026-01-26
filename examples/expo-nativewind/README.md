# Harken SDK + NativeWind Example

This example demonstrates the Harken SDK working alongside NativeWind 4.x in an Expo application.

## Overview

- **App UI**: Uses NativeWind/Tailwind CSS classes (`className`)
- **Harken components**: Use traditional React Native StyleSheet
- **Both work together** without conflict or additional configuration

## Key Points

### No Special Setup Required

The Harken SDK is compatible with NativeWind 4.x out of the box. You don't need to:

- Configure `cssInterop()` for Harken components
- Wrap Harken components in special containers
- Disable NativeWind for certain component trees

Just use `HarkenProvider` and `FeedbackSheet` as normal.

### Theme Customization

This example shows how to customize Harken's theme to match Tailwind's color palette:

```tsx
const tailwindTheme: PartialHarkenTheme = {
  colors: {
    // Map to Tailwind's indigo palette
    primary: "#6366f1", // indigo-500
    primaryPressed: "#4f46e5", // indigo-600

    // Map to Tailwind's slate palette
    background: "#0f172a", // slate-900
    surface: "#1e293b", // slate-800
    text: "#f8fafc", // slate-50
    // ...
  },
  typography: {
    buttonTextSize: 16,
    buttonTextWeight: "600",
  },
  spacing: {
    buttonPaddingVertical: 12, // py-3
    buttonPaddingHorizontal: 24, // px-6
  },
  radii: {
    button: 12, // rounded-xl
  },
};
```

## Running the Example

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on your device or simulator:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## Project Structure

```
expo-nativewind/
├── App.tsx              # Main app with HarkenProvider and NativeWind
├── global.css           # Tailwind CSS entry point
├── tailwind.config.js   # Tailwind configuration
├── babel.config.js      # Babel with NativeWind preset
├── metro.config.js      # Metro with NativeWind transformer
├── nativewind-env.d.ts  # TypeScript declarations
└── package.json
```

## NativeWind Setup

This example uses NativeWind 4.x with the following configuration:

### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
  };
};
```

### metro.config.js

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

## Troubleshooting

### Styles not applying to Harken components?

Make sure you're using the latest version of `@harkenapp/sdk-react-native` (0.0.1-alpha.8+). Earlier versions had compatibility issues with NativeWind 4.x.

### TypeScript errors with className?

Ensure `nativewind-env.d.ts` is included in your `tsconfig.json`:

```json
{
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts"]
}
```

## Learn More

- [Harken SDK Documentation](../../docs/)
- [Harken Theming Guide](../../docs/theming.md)
- [NativeWind Documentation](https://www.nativewind.dev/)
