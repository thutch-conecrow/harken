# Theming

Harken's UI components are fully themeable. You can customize colors, typography, spacing, border radii, sizing, and opacity to match your app's design system.

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

### Base Color Tokens

These tokens control the overall color scheme. Component tokens (below) fall back to these.

| Token | Description | Light Default | Dark Default |
|-------|-------------|---------------|--------------|
| `primary` | Brand color for buttons, accents | `#2563EB` | `#3B82F6` |
| `primaryPressed` | Pressed state of primary | `#1D4ED8` | `#2563EB` |
| `background` | Main app background | `#FFFFFF` | `#111827` |
| `surface` | Container/modal surface | `#F9FAFB` | `#1F2937` |
| `backgroundSecondary` | Alias for `surface` (backwards compat) | `#F9FAFB` | `#1F2937` |
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

### Component Color Tokens

For granular control, override specific component colors. All are optional and fall back to base tokens.

#### Category Chips

| Token | Fallback |
|-------|----------|
| `chipBackground` | `surface` |
| `chipBackgroundSelected` | `primary` |
| `chipBorder` | `border` |
| `chipBorderSelected` | `primary` |
| `chipText` | `text` |
| `chipTextSelected` | `textOnPrimary` |

#### Text Inputs

| Token | Fallback |
|-------|----------|
| `inputBackground` | `surface` |
| `inputBorder` | `border` |
| `inputBorderFocused` | `borderFocused` |
| `inputBorderError` | `error` |
| `inputText` | `text` |
| `inputPlaceholder` | `textPlaceholder` |

#### Buttons

| Token | Fallback |
|-------|----------|
| `buttonPrimaryBackground` | `primary` |
| `buttonPrimaryBackgroundPressed` | `primaryPressed` |
| `buttonPrimaryText` | `textOnPrimary` |
| `buttonSecondaryBackground` | `surface` |
| `buttonSecondaryBorder` | `border` |
| `buttonSecondaryText` | `text` |
| `buttonGhostText` | `text` |

#### Add Button (Attachment Grid)

| Token | Fallback |
|-------|----------|
| `addButtonBackground` | `surface` |
| `addButtonBackgroundPressed` | `border` |
| `addButtonBorder` | `border` |
| `addButtonIcon` | `textSecondary` |
| `addButtonText` | `textSecondary` |

#### Attachment Tiles

| Token | Fallback |
|-------|----------|
| `tileBackground` | `surface` |
| `tileBorder` | `border` |

#### Upload Status Overlay

| Token | Fallback |
|-------|----------|
| `uploadOverlay` | `overlay` |
| `uploadOverlayError` | `overlayDark` |
| `uploadProgressTrack` | `rgba(255,255,255,0.3)` |
| `uploadProgressFill` | `primary` |
| `uploadBadgeSuccess` | `success` |
| `uploadText` | `textOnPrimary` |

#### Attachment Picker

| Token | Fallback |
|-------|----------|
| `pickerOverlay` | `overlay` |
| `pickerBackground` | `background` |
| `pickerHandle` | `textSecondary` |
| `pickerOptionBackground` | `surface` |
| `pickerOptionBackgroundPressed` | `border` |
| `pickerCancelText` | `error` |

#### Form Container

| Token | Fallback |
|-------|----------|
| `formBackground` | `background` |

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

### Base Spacing Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `xs` | Extra small | `4` |
| `sm` | Small | `8` |
| `md` | Medium | `16` |
| `lg` | Large | `24` |
| `xl` | Extra large | `32` |
| `xxl` | 2x extra large | `48` |

### Component Spacing Tokens

| Token | Fallback |
|-------|----------|
| `chipPaddingVertical` | `sm` (8) |
| `chipPaddingHorizontal` | `md` (16) |
| `chipGap` | `sm` (8) |
| `inputPadding` | `md` (16) |
| `buttonPaddingVertical` | `sm` (8) |
| `buttonPaddingHorizontal` | `md` (16) |
| `formPadding` | `lg` (24) |
| `sectionGap` | `lg` (24) |
| `tileGap` | `sm` (8) |

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

### Base Radii Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `none` | No radius | `0` |
| `sm` | Subtle rounding | `4` |
| `md` | Inputs, cards | `8` |
| `lg` | Modals, sheets | `16` |
| `xl` | Bottom sheets | `20` |
| `full` | Pill shape | `9999` |

### Component Radii Tokens

| Token | Fallback |
|-------|----------|
| `chip` | `full` (9999) |
| `input` | `md` (8) |
| `button` | `md` (8) |
| `tile` | `md` (8) |
| `form` | `lg` (16) |
| `picker` | `xl` (20) |

## Customizing Sizing

Control component dimensions:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  lightTheme={{
    sizing: {
      buttonMinHeight: 56,
      tileSize: 100,
    },
  }}
>
```

### Sizing Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `buttonMinHeight` | Minimum button height | `48` |
| `inputMinHeight` | Minimum input height | `44` |
| `tileSize` | Attachment tile size | `80` |
| `addButtonIconSize` | Add button icon size | `28` |
| `pickerIconSize` | Picker option icon size | `44` |

## Customizing Opacity

Control opacity states:

```tsx
<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  lightTheme={{
    opacity: {
      disabled: 0.5,
      pressed: 0.7,
    },
  }}
>
```

### Opacity Tokens

| Token | Description | Default |
|-------|-------------|---------|
| `disabled` | Disabled element opacity | `0.6` |
| `pressed` | Pressed state opacity | `0.8` |

## Using Theme in Custom Components

Access the current theme with `useHarkenTheme`:

```tsx
import { useHarkenTheme, ThemedText } from '@harkenapp/sdk-react-native';

function CustomComponent() {
  const theme = useHarkenTheme();

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
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

### Structured Component Access

For better discoverability, use the `components` namespace:

```tsx
const theme = useHarkenTheme();

// These are equivalent:
const chipBg = theme.colors.chipBackground;
const chipBg = theme.components.chip.background;

// Structured access groups related tokens:
const { chip, input, button, form } = theme.components;

<View style={{
  backgroundColor: chip.background,
  borderColor: chip.border,
  borderRadius: chip.radius,
  paddingVertical: chip.paddingVertical,
  paddingHorizontal: chip.paddingHorizontal,
}}>
```

Available component groups:
- `theme.components.chip` - Category selector chips
- `theme.components.input` - Text inputs
- `theme.components.button` - Buttons (with `.primary`, `.secondary`, `.ghost`)
- `theme.components.addButton` - Add attachment button
- `theme.components.tile` - Attachment tiles
- `theme.components.upload` - Upload status overlay
- `theme.components.picker` - Attachment picker modal
- `theme.components.form` - Form container

## Modal Embedding

When embedding `FeedbackSheet` in a bottom sheet modal, use these techniques:

### Layout Mode

Use `layout="auto"` to prevent the default `flex: 1` from collapsing:

```tsx
<FeedbackSheet
  layout="auto"  // Content determines height
  title=""       // Hide title (modal has its own)
  onSuccess={() => closeModal()}
/>
```

### Modal Theme Recipe

For dark-themed modals, override these tokens to ensure visibility:

```tsx
const modalDarkTheme = {
  colors: {
    // Your modal's background color
    surface: '#2d2d2d',

    // Make chips stand out from surface
    chipBackground: '#3d3d3d',
    chipBorder: '#4d4d4d',

    // Transparent to inherit modal background
    formBackground: 'transparent',

    // Text colors for dark mode
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    textPlaceholder: '#666666',

    // Your brand primary
    primary: '#0066ff',
  },
};

<HarkenProvider
  config={{ publishableKey: 'pk_live_xxx' }}
  themeMode="dark"
  darkTheme={modalDarkTheme}
>
  <FeedbackSheet layout="auto" title="" />
</HarkenProvider>
```

### Style Escape Hatches

For one-off layout adjustments, use style props:

```tsx
<FeedbackSheet
  containerStyle={{ maxHeight: 500 }}
  contentStyle={{ paddingTop: 8 }}
/>
```

## Creating a Complete Custom Theme

For full control, use `createTheme`:

```tsx
import {
  HarkenProvider,
  createTheme,
  lightTheme,
  darkTheme,
} from '@harkenapp/sdk-react-native';

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
  sizing: {
    buttonMinHeight: 52,
  },
  opacity: {
    disabled: 0.5,
  },
});
```

## Themed Components

The SDK provides pre-themed components that automatically use your theme:

- `ThemedText` - Text with variant support (title, body, label, caption)
- `ThemedTextInput` - Styled text input
- `ThemedButton` - Primary/secondary/ghost buttons
- `CategorySelector` - Feedback category picker
- `AttachmentGrid` - Attachment preview grid
- `AttachmentPicker` - Source selection modal
- `FeedbackSheet` - Complete feedback form

All these components respect your theme customizations automatically.
