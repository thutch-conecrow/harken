// Re-export all generated types
export type { paths, webhooks, components, operations } from "./types.js";

// Convenience type aliases for schemas
import type { components } from "./types.js";

// Enums
export type FeedbackCategory = components["schemas"]["FeedbackCategory"];
export type FeedbackStatus = components["schemas"]["FeedbackStatus"];
export type Platform = components["schemas"]["Platform"];
export type AttachmentStatus = components["schemas"]["AttachmentStatus"];

// Common
export type DeviceMetadata = components["schemas"]["DeviceMetadata"];

// Feedback Submission (SDK)
export type FeedbackSubmission = components["schemas"]["FeedbackSubmission"];
export type FeedbackSubmissionResponse = components["schemas"]["FeedbackSubmissionResponse"];

// Attachments (SDK)
export type AttachmentPresignRequest = components["schemas"]["AttachmentPresignRequest"];
export type AttachmentPresignResponse = components["schemas"]["AttachmentPresignResponse"];
export type AttachmentConfirmRequest = components["schemas"]["AttachmentConfirmRequest"];
export type AttachmentStatusResponse = components["schemas"]["AttachmentStatusResponse"];
export type AttachmentUrls = components["schemas"]["AttachmentUrls"];

// Console
export type FeedbackItem = components["schemas"]["FeedbackItem"];
export type FeedbackListResponse = components["schemas"]["FeedbackListResponse"];
export type FeedbackUpdateRequest = components["schemas"]["FeedbackUpdateRequest"];
export type AttachmentInfo = components["schemas"]["AttachmentInfo"];
export type App = components["schemas"]["App"];
export type AppsListResponse = components["schemas"]["AppsListResponse"];

// Errors
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type ErrorDetail = components["schemas"]["ErrorDetail"];
