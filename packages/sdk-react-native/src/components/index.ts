// Base themed components
export { ThemedText } from './ThemedText';
export type { ThemedTextProps, TextVariant } from './ThemedText';

export { ThemedTextInput } from './ThemedTextInput';
export type { ThemedTextInputProps } from './ThemedTextInput';

export { ThemedButton } from './ThemedButton';
export type { ThemedButtonProps, ButtonVariant } from './ThemedButton';

// Feedback components
export { CategorySelector, DEFAULT_CATEGORIES } from './CategorySelector';
export type { CategorySelectorProps, CategoryOption } from './CategorySelector';

export { FeedbackForm } from './FeedbackForm';
export type { FeedbackFormProps, FeedbackFormData } from './FeedbackForm';

// Note: Attachment components (AttachmentPicker, AttachmentGrid, etc.) are
// exported from '@harken/sdk-react-native/attachments' to avoid eager
// loading of native modules via their type imports.
