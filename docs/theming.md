# Theming

Harken's UI components are fully themeable. You can customize colors, typography, spacing, and border radii to match your app's design system.

## Theme Mode

Control light/dark mode with the `themeMode` prop:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  themeMode="system" // 'light' | 'dark' | 'system'
>
```

- `'light'` - Always use light theme
- `'dark'` - Always use dark theme
- `'system'` (default) - Follow device color scheme

## Customizing Colors

Override specific colors while keeping defaults for the rest:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  lightTheme={{
    colors: {
      primary: '#7C3AED',        // Your brand purple
      primaryPressed: '#6D28D9', // Darker on press
    },
  }}
  darkTheme={{
    colors: {
      primary: '#A78BFA',
      primaryPressed: '#8B5CF6',
    },
  }}
>
```

### Available Color Tokens

| Token | Description | Light Default | Dark Default |
|-------|-------------|---------------|--------------|
| `primary` | Brand color for buttons, accents | `#2563EB` | `#3B82F6` |
| `primaryPressed` | Pressed state of primary | `#1D4ED8` | `#2563EB` |
| `background` | Main background | `#FFFFFF` | `#111827` |
| `backgroundSecondary` | Cards, inputs | `#F9FAFB` | `#1F2937` |
| `text` | Primary text | `#111827` | `#F9FAFB` |
| `textSecondary` | Muted text | `#6B7280` | `#9CA3AF` |
| `textPlaceholder` | Input placeholders | `#9CA3AF` | `#6B7280` |
| `textOnPrimary` | Text on primary bg | `#FFFFFF` | `#FFFFFF` |
| `border` | Input/divider borders | `#E5E7EB` | `#374151` |
| `borderFocused` | Focused input border | `#2563EB` | `#3B82F6` |
| `error` | Error states | `#DC2626` | `#EF4444` |
| `success` | Success states | `#16A34A` | `#22C55E` |
| `warning` | Warning states | `#D97706` | `#F59E0B` |
| `info` | Info states | `#2563EB` | `#3B82F6` |
| `overlay` | Modal overlay | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.5)` |
| `overlayDark` | Heavy overlay | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.8)` |
| `accent1` | Camera option icon | `#2563EB` | `#3B82F6` |
| `accent2` | Photo library icon | `#16A34A` | `#22C55E` |
| `accent3` | Files option icon | `#D97706` | `#F59E0B` |

## Customizing Typography

Adjust fonts, sizes, and weights:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  lightTheme={{
    typography: {
      fontFamily: 'Inter',
      fontFamilyHeading: 'Inter-Bold',
      titleSize: 24,
      bodySize: 15,
    },
  }}
>
```

### Typography Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `fontFamily` | Body text font | `'System'` |
| `fontFamilyHeading` | Heading font (falls back to fontFamily) | `undefined` |
| `titleSize` | Title text size | `20` |
| `titleLineHeight` | Title line height multiplier | `1.3` |
| `titleWeight` | Title font weight | `'600'` |
| `bodySize` | Body text size | `16` |
| `bodyLineHeight` | Body line height multiplier | `1.5` |
| `bodyWeight` | Body font weight | `'normal'` |
| `labelSize` | Label/button text size | `14` |
| `labelWeight` | Label font weight | `'500'` |
| `captionSize` | Small text size | `12` |
| `captionWeight` | Caption font weight | `'normal'` |

### Font Weights

Supported values: `'normal'`, `'bold'`, `'100'` through `'900'`

## Customizing Spacing

Adjust the spacing scale (based on a 4px grid):

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  lightTheme={{
    spacing: {
      sm: 12,  // More breathing room
      md: 20,
      lg: 28,
    },
  }}
>
```

### Spacing Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `xs` | Extra small | `4` |
| `sm` | Small | `8` |
| `md` | Medium | `16` |
| `lg` | Large | `24` |
| `xl` | Extra large | `32` |
| `xxl` | 2x extra large | `48` |

## Customizing Border Radii

Control corner rounding:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  lightTheme={{
    radii: {
      sm: 2,   // Sharper corners
      md: 4,
      lg: 8,
    },
  }}
>
```

### Radii Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `none` | No radius | `0` |
| `sm` | Subtle rounding | `4` |
| `md` | Inputs, cards | `8` |
| `lg` | Modals, sheets | `16` |
| `xl` | Bottom sheets | `20` |
| `full` | Pill shape | `9999` |

## Using Theme in Custom Components

Access the current theme with `useHarkenTheme`:

```tsx
import { useHarkenTheme, ThemedText } from '@harken/sdk-react-native';

function CustomComponent() {
  const theme = useHarkenTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.backgroundSecondary,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
    }}>
      <ThemedText variant="body">
        Styled with theme tokens
      </ThemedText>
    </View>
  );
}
```

## Creating a Complete Custom Theme

For full control, use `createTheme`:

```tsx
import {
  HarkenProvider,
  createTheme,
  lightTheme,
  darkTheme,
} from '@harken/sdk-react-native';

const myLightTheme = createTheme(lightTheme, {
  colors: {
    primary: '#7C3AED',
    primaryPressed: '#6D28D9',
  },
  typography: {
    fontFamily: 'Inter',
    titleSize: 22,
  },
  spacing: {
    md: 20,
  },
  radii: {
    md: 12,
  },
});

const myDarkTheme = createTheme(darkTheme, {
  colors: {
    primary: '#A78BFA',
    primaryPressed: '#8B5CF6',
  },
  typography: {
    fontFamily: 'Inter',
    titleSize: 22,
  },
});

// Note: When using createTheme, pass the full theme objects
// The provider's lightTheme/darkTheme props expect partial overrides
```

## Themed Components

The SDK provides pre-themed components that automatically use your theme:

- `ThemedText` - Text with variant support (title, body, label, caption)
- `ThemedTextInput` - Styled text input
- `ThemedButton` - Primary/secondary buttons
- `CategorySelector` - Feedback category picker
- `AttachmentGrid` - Attachment preview grid
- `AttachmentPicker` - Source selection modal

All these components respect your theme customizations automatically.
