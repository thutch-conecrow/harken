/**
 * Mock expo-image-picker for testing.
 */

export interface ImagePickerOptions {
  mediaTypes?: string[];
  quality?: number;
}

export interface ImagePickerResult {
  canceled: boolean;
  assets: Array<{
    uri: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }> | null;
}

let mockResult: ImagePickerResult = { canceled: true, assets: null };

export async function launchCameraAsync(_options?: ImagePickerOptions): Promise<ImagePickerResult> {
  return mockResult;
}

export async function launchImageLibraryAsync(
  _options?: ImagePickerOptions
): Promise<ImagePickerResult> {
  return mockResult;
}

// Helper to set mock result for tests
export function __setMockResult(result: ImagePickerResult): void {
  mockResult = result;
}

export function __resetMock(): void {
  mockResult = { canceled: true, assets: null };
}

export default {
  launchCameraAsync,
  launchImageLibraryAsync,
  __setMockResult,
  __resetMock,
};
