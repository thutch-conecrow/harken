# API Reference

Complete reference for all exports from `@harkenapp/sdk-react-native`.

## Provider

### HarkenProvider

Wrap your app to enable Harken functionality.

```tsx
import { HarkenProvider } from '@harkenapp/sdk-react-native';

<HarkenProvider
  config={{
    publishableKey: 'pk_live_xxx',
    userToken: 'optional-jwt',
    apiBaseUrl: 'https://api.harken.app',
    debug: false,
  }}
  themeMode="system"
  lightTheme={{ colors: { primary: '#007AFF' } }}
  darkTheme={{ colors: { primary: '#0A84FF' } }}
  storage={customStorage}
>
  <App />
</HarkenProvider>
```

## High-Level Components

### FeedbackSheet

Batteries-included feedback form with attachments.

```tsx
import { FeedbackSheet } from '@harkenapp/sdk-react-native';

<FeedbackSheet
  // Callbacks
  onSuccess={(result) => {}}
  onError={(error) => {}}
  onCancel={() => {}}

  // Labels
  title="Send Feedback"         // Set to "" to hide title section
  placeholder="What would you like to share?"
  submitLabel="Submit"
  cancelLabel="Cancel"

  // Categories
  categories={[{ value: 'bug', label: 'Bug' }]}
  requireCategory={false}

  // Message
  minMessageLength={1}
  maxMessageLength={5000}

  // Attachments
  enableAttachments={true}
  maxAttachments={5}
  attachmentSources={{ camera: true, library: true, files: true }}

  // Behavior
  showSuccessAlert={true}
  clearOnSuccess={true}

  // Layout (for modal embedding)
  layout="flex"                 // 'flex' | 'auto' - use 'auto' for modals
  containerStyle={{}}           // Outer container style
  contentStyle={{}}             // Inner scrollable content style
/>
```

## Hooks

### useFeedback

Submit feedback to Harken.

```tsx
const {
  submitFeedback,  // (params) => Promise<FeedbackSubmissionResponse>
  isSubmitting,    // boolean
  isInitializing,  // boolean (waiting for anonymous ID)
  error,           // Error | null
  clearError,      // () => void
} = useFeedback();

await submitFeedback({
  message: 'Bug report',
  category: 'bug',  // 'bug' | 'idea' | 'ux' | 'other'
  attachments: ['attachment-id-1'],
  metadata: { customField: 'value' },
});
```

### useAttachmentUpload

Manage file uploads.

```tsx
const {
  attachments,       // AttachmentState[]
  pickImage,         // (source: 'camera' | 'library') => Promise<AttachmentState | null>
  pickDocument,      // () => Promise<AttachmentState | null>
  addAttachment,     // (params) => Promise<AttachmentState>
  removeAttachment,  // (id: string) => Promise<void>
  retryAttachment,   // (id: string) => Promise<void>
  getAttachmentIds,  // () => string[]
  hasActiveUploads,  // boolean
  clearCompleted,    // () => void
  clearFailed,       // () => void
} = useAttachmentUpload();
```

### useAttachmentPicker

Convenience hook combining upload with picker modal.

```tsx
const {
  attachments,
  removeAttachment,
  retryAttachment,
  getAttachmentIds,
  hasActiveUploads,
  openPicker,        // () => void
  pickerProps,       // Props to spread on AttachmentPicker
  enabledSourceCount,
} = useAttachmentPicker({
  camera: true,
  library: true,
  files: true,
});
```

### useHarkenTheme

Access current resolved theme with all tokens populated.

```tsx
const theme = useHarkenTheme();

// Flat token access
theme.colors.primary
theme.colors.chipBackground
theme.spacing.md
theme.radii.chip
theme.sizing.buttonMinHeight
theme.opacity.disabled

// Structured component access (same values, better discoverability)
theme.components.chip.background
theme.components.input.border
theme.components.button.primary.text
theme.components.form.padding
```

### useHarkenContext

Access SDK context (advanced).

```tsx
const { client, config, theme, identityStore } = useHarkenContext();
```

### useAnonymousId

Access the anonymous device ID.

```tsx
const {
  anonymousId,   // string | null
  isLoading,     // boolean
  error,         // Error | null
  regenerate,    // () => Promise<string>
} = useAnonymousId();
```

### useAttachmentStatus

Poll attachment upload status from server.

```tsx
const { status, isLoading, error, refetch } = useAttachmentStatus(attachmentId);
```

## UI Components

### ThemedText

Text component with theme support.

```tsx
<ThemedText
  variant="title"  // 'title' | 'body' | 'label' | 'caption'
  secondary        // Use secondary text color
  color="#custom"  // Override color
>
  Hello
</ThemedText>
```

### ThemedTextInput

Text input with theme support.

```tsx
<ThemedTextInput
  value={text}
  onChangeText={setText}
  placeholder="Enter text..."
  multiline
  numberOfLines={4}
/>
```

### ThemedButton

Button with theme support.

```tsx
<ThemedButton
  title="Submit"
  variant="primary"  // 'primary' | 'secondary'
  onPress={handlePress}
  disabled={false}
  loading={false}
  fullWidth
/>
```

### CategorySelector

Feedback category picker.

```tsx
<CategorySelector
  value={category}
  onChange={setCategory}
  categories={[
    { value: 'bug', label: 'Bug', icon: '🐛' },
    { value: 'idea', label: 'Idea', icon: '💡' },
  ]}
  disabled={false}
/>
```

### AttachmentPicker

Modal for selecting attachment source.

```tsx
<AttachmentPicker
  visible={isVisible}
  onClose={() => setVisible(false)}
  onSelectCamera={handleCamera}
  onSelectLibrary={handleLibrary}
  onSelectFiles={handleFiles}
  enableCamera={true}
  enableLibrary={true}
  enableFiles={true}
/>
```

### AttachmentGrid

Grid of attachment previews.

```tsx
<AttachmentGrid
  attachments={attachments}
  onRemove={removeAttachment}
  onRetry={retryAttachment}
  onAdd={openPicker}
  maxAttachments={5}
  showAddButton={true}
/>
```

### AttachmentPreview

Single attachment preview.

```tsx
<AttachmentPreview
  uri={localUri}
  phase={UploadPhase.UPLOADING}
  progress={0.5}
  onRemove={handleRemove}
  onRetry={handleRetry}
/>
```

### UploadStatusOverlay

Upload progress overlay.

```tsx
<UploadStatusOverlay
  phase={UploadPhase.UPLOADING}
  progress={0.5}
  onRetry={handleRetry}
/>
```

## Theme

### Theme Types

```typescript
// Input theme (what you provide)
interface HarkenTheme {
  colors: HarkenColors;        // Base + optional component tokens
  typography: HarkenTypography;
  spacing: HarkenSpacing;      // Base + optional component tokens
  radii: HarkenRadii;          // Base + optional component tokens
  sizing?: HarkenSizing;       // Optional sizing overrides
  opacity?: HarkenOpacity;     // Optional opacity overrides
}

// Partial theme for overriding specific values
interface PartialHarkenTheme {
  colors?: Partial<HarkenColors>;
  typography?: Partial<HarkenTypography>;
  spacing?: Partial<HarkenSpacing>;
  radii?: Partial<HarkenRadii>;
  sizing?: Partial<HarkenSizing>;
  opacity?: Partial<HarkenOpacity>;
}

// Resolved theme (what useHarkenTheme returns)
interface ResolvedHarkenTheme {
  colors: ResolvedHarkenColors;    // All tokens populated
  typography: HarkenTypography;
  spacing: ResolvedHarkenSpacing;
  radii: ResolvedHarkenRadii;
  sizing: ResolvedHarkenSizing;
  opacity: ResolvedHarkenOpacity;
  components: HarkenComponentTokens;  // Structured access
}

type ThemeMode = 'light' | 'dark' | 'system';
```

### Default Themes

```tsx
import {
  lightTheme,
  darkTheme,
  lightColors,
  darkColors,
  defaultTypography,
  defaultSpacing,
  defaultRadii,
  createTheme,
  resolveTheme,
} from '@harkenapp/sdk-react-native';

// Create theme with overrides (for passing to HarkenProvider)
const customTheme = createTheme(lightTheme, {
  colors: { primary: '#7C3AED' },
  sizing: { buttonMinHeight: 52 },
  opacity: { disabled: 0.5 },
});
```

## Storage

### createSecureStoreAdapter

Create storage adapter from expo-secure-store.

```tsx
import * as SecureStore from 'expo-secure-store';
import { createSecureStoreAdapter } from '@harkenapp/sdk-react-native';

const storage = createSecureStoreAdapter(SecureStore);
```

### createMemoryStorage

Create in-memory storage (for testing).

```tsx
import { createMemoryStorage } from '@harkenapp/sdk-react-native';

const storage = createMemoryStorage();
```

## API Client

### HarkenClient

Low-level API client (usually not needed directly).

```tsx
import { createHarkenClient } from '@harkenapp/sdk-react-native';

const client = createHarkenClient({
  publishableKey: 'pk_live_xxx',
  apiBaseUrl: 'https://api.harken.app',
});
```

### Error Types

```tsx
import {
  HarkenError,        // Base error class
  HarkenApiError,     // API returned an error
  HarkenNetworkError, // Network request failed
} from '@harkenapp/sdk-react-native';
```

## Domain Types

### UploadPhase

```typescript
enum UploadPhase {
  QUEUED = 'queued',
  UPLOADING = 'uploading',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

### FeedbackCategory

```typescript
type FeedbackCategory = 'bug' | 'idea' | 'ux' | 'other';
```

### Platform

```typescript
type Platform = 'ios' | 'android';
```

## Constants

### DEFAULT_CATEGORIES

Default feedback categories.

```tsx
import { DEFAULT_CATEGORIES } from '@harkenapp/sdk-react-native';

// [
//   { value: 'bug', label: 'Bug', icon: '🐛' },
//   { value: 'idea', label: 'Idea', icon: '💡' },
//   { value: 'ux', label: 'UX', icon: '🎨' },
//   { value: 'other', label: 'Other', icon: '💬' },
// ]
```

### DEFAULT_RETRY_CONFIG

Default retry configuration for API calls.

```tsx
import { DEFAULT_RETRY_CONFIG } from '@harkenapp/sdk-react-native';

// { maxRetries: 3, initialDelay: 1000, maxDelay: 30000 }
```
