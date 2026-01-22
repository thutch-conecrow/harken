# Attachments

Harken supports file attachments with feedback submissions. Users can attach photos (from camera or library) and documents. Uploads happen in the background with automatic retry.

## Quick Start

The `FeedbackSheet` component includes attachment support by default:

```tsx
import { FeedbackSheet } from "@harkenapp/sdk-react-native";

<FeedbackSheet
  enableAttachments={true} // default
  maxAttachments={5} // default
  onSuccess={() => navigation.goBack()}
/>;
```

## Configuring Attachment Sources

Control which sources are available:

```tsx
<FeedbackSheet
  attachmentSources={{
    camera: true, // Take photo with camera
    library: true, // Select from photo library
    files: true, // Pick documents (images, PDFs)
  }}
/>
```

Disable specific sources:

```tsx
// Photo library only - no camera or files
<FeedbackSheet
  attachmentSources={{
    camera: false,
    library: true,
    files: false,
  }}
/>
```

When only one source is enabled, the picker modal is skipped and that source opens directly.

## Using the Attachment Hook

For custom UIs, use `useAttachmentUpload` directly:

```tsx
import {
  useAttachmentUpload,
  AttachmentGrid,
  AttachmentPicker,
  UploadPhase,
} from "@harkenapp/sdk-react-native";

function CustomFeedbackForm() {
  const {
    attachments,
    pickImage,
    pickDocument,
    removeAttachment,
    retryAttachment,
    getAttachmentIds,
    hasActiveUploads,
  } = useAttachmentUpload();

  return (
    <View>
      {/* Show attachment previews */}
      <AttachmentGrid
        attachments={attachments}
        onRemove={removeAttachment}
        onRetry={retryAttachment}
        maxAttachments={5}
      />

      {/* Picker buttons */}
      <Button onPress={() => pickImage("camera")} title="Take Photo" />
      <Button onPress={() => pickImage("library")} title="Choose Photo" />
      <Button onPress={pickDocument} title="Pick Document" />

      {/* Submit feedback */}
      <Button
        onPress={() =>
          submitFeedback({
            message: "My feedback",
            attachments: getAttachmentIds(),
          })
        }
        title={hasActiveUploads ? "Submit (uploads continue)" : "Submit"}
      />
    </View>
  );
}
```

## Upload Lifecycle

Attachments go through these phases:

| Phase        | Description                             |
| ------------ | --------------------------------------- |
| `QUEUED`     | Waiting to be processed                 |
| `UPLOADING`  | Uploading to storage                    |
| `CONFIRMING` | Upload complete, confirming with server |
| `COMPLETED`  | Successfully uploaded and confirmed     |
| `FAILED`     | Failed after max retries                |

Check the phase to show appropriate UI:

```tsx
import { UploadPhase } from "@harkenapp/sdk-react-native";

attachments.map((att) => {
  switch (att.phase) {
    case UploadPhase.QUEUED:
    case UploadPhase.UPLOADING:
      return <ProgressBar progress={att.progress} />;
    case UploadPhase.CONFIRMING:
      return <Text>Confirming...</Text>;
    case UploadPhase.COMPLETED:
      return <CheckIcon />;
    case UploadPhase.FAILED:
      return <RetryButton onPress={() => retryAttachment(att.attachmentId)} />;
  }
});
```

## Background Uploads

Uploads continue in the background:

- If the user navigates away
- If the app is backgrounded (within OS limits)
- If network connectivity is temporarily lost

This means users can submit feedback immediately without waiting for uploads to complete. The feedback is associated with the attachment IDs, and the files will be available once uploads finish.

```tsx
const { hasActiveUploads, getAttachmentIds } = useAttachmentUpload();

// Can submit even with active uploads
await submitFeedback({
  message: "Bug report",
  attachments: getAttachmentIds(), // IDs are available immediately
});

// Inform user if needed
if (hasActiveUploads) {
  Alert.alert("Submitted", "Your feedback was sent. Attachments are still uploading.");
}
```

## Automatic Retry

Failed uploads are automatically retried with exponential backoff:

- Initial delay: 1 second
- Max delay: 30 seconds
- Max retries: 3

After max retries, the attachment enters `FAILED` state. Users can manually retry:

```tsx
const { retryAttachment } = useAttachmentUpload();

<Button onPress={() => retryAttachment(attachment.attachmentId)} title="Retry Upload" />;
```

## Attachment State

Each attachment has this state:

```typescript
interface AttachmentState {
  attachmentId: string; // Server-assigned ID
  localUri: string; // Local file URI for preview
  fileName: string; // Original filename
  mimeType: string; // MIME type (image/jpeg, application/pdf, etc.)
  phase: UploadPhase; // Current upload phase
  progress: number; // Upload progress (0.0 - 1.0)
  error?: string; // Error message if failed
}
```

## useAttachmentUpload API

| Method                  | Description                         |
| ----------------------- | ----------------------------------- |
| `attachments`           | Array of current attachments        |
| `pickImage(source)`     | Pick from `'camera'` or `'library'` |
| `pickDocument()`        | Pick document (images or PDFs)      |
| `addAttachment(params)` | Add attachment from existing URI    |
| `removeAttachment(id)`  | Remove and cancel if uploading      |
| `retryAttachment(id)`   | Retry a failed upload               |
| `getAttachmentIds()`    | Get IDs for feedback submission     |
| `hasActiveUploads`      | True if any uploads in progress     |
| `clearCompleted()`      | Remove all completed attachments    |
| `clearFailed()`         | Remove all failed attachments       |

## Components

### AttachmentGrid

Displays attachment previews with upload status:

```tsx
<AttachmentGrid
  attachments={attachments}
  onRemove={removeAttachment}
  onRetry={retryAttachment}
  onAdd={openPicker} // Optional: show add button
  maxAttachments={5}
  showAddButton={true}
/>
```

### AttachmentPicker

Modal for selecting attachment source (iOS ActionSheet, Android bottom sheet):

```tsx
const { pickerProps, openPicker } = useAttachmentPicker();

<Button onPress={openPicker} title="Add Attachment" />
<AttachmentPicker {...pickerProps} />
```

### AttachmentPreview

Single attachment thumbnail with status overlay:

```tsx
<AttachmentPreview
  uri={attachment.localUri}
  phase={attachment.phase}
  progress={attachment.progress}
  onRemove={() => removeAttachment(attachment.attachmentId)}
  onRetry={() => retryAttachment(attachment.attachmentId)}
/>
```

### UploadStatusOverlay

Overlay showing upload progress/status:

```tsx
<UploadStatusOverlay
  phase={attachment.phase}
  progress={attachment.progress}
  onRetry={handleRetry}
/>
```

## Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF

Maximum file size is configured server-side (default: 10MB).

## Permissions

The SDK's Expo config plugin automatically configures required permissions:

**iOS:**

- `NSCameraUsageDescription` - Camera access
- `NSPhotoLibraryUsageDescription` - Photo library access

**Android:**

- `android.permission.CAMERA`
- `android.permission.READ_MEDIA_IMAGES` (Android 13+)
- `android.permission.READ_EXTERNAL_STORAGE` (Android 12-)

See [Getting Started](./getting-started.md#permissions-setup) for setup instructions.
