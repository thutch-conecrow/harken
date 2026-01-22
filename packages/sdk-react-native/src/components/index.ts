// Base themed components
export { ThemedText } from "./ThemedText";
export type { ThemedTextProps, TextVariant } from "./ThemedText";

export { ThemedTextInput } from "./ThemedTextInput";
export type { ThemedTextInputProps } from "./ThemedTextInput";

export { ThemedButton } from "./ThemedButton";
export type { ThemedButtonProps, ButtonVariant } from "./ThemedButton";

// Feedback components
export { CategorySelector, DEFAULT_CATEGORIES } from "./CategorySelector";
export type { CategorySelectorProps, CategoryOption } from "./CategorySelector";

export { FeedbackForm } from "./FeedbackForm";
export type { FeedbackFormProps, FeedbackFormData } from "./FeedbackForm";

// Note: FeedbackSheet is exported from the main entry point (comes from attachments module)
// to provide full attachment support by default.

// Attachment components
export { AttachmentPicker } from "./AttachmentPicker";
export type {
  AttachmentPickerProps,
  AttachmentSource,
  PickerOptionConfig,
} from "./AttachmentPicker";

export { UploadStatusOverlay } from "./UploadStatusOverlay";
export type { UploadStatusOverlayProps, UploadStatusLabels } from "./UploadStatusOverlay";

export { AttachmentPreview } from "./AttachmentPreview";
export type { AttachmentPreviewProps } from "./AttachmentPreview";

export { AttachmentGrid } from "./AttachmentGrid";
export type { AttachmentGridProps } from "./AttachmentGrid";
