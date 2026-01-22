/**
 * Mock expo-document-picker for testing.
 */

export interface DocumentPickerOptions {
  type?: string[];
  copyToCacheDirectory?: boolean;
}

export interface DocumentPickerResult {
  canceled: boolean;
  assets: Array<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  }> | null;
}

let mockResult: DocumentPickerResult = { canceled: true, assets: null };

export async function getDocumentAsync(
  _options?: DocumentPickerOptions
): Promise<DocumentPickerResult> {
  return mockResult;
}

// Helper to set mock result for tests
export function __setMockResult(result: DocumentPickerResult): void {
  mockResult = result;
}

export function __resetMock(): void {
  mockResult = { canceled: true, assets: null };
}

export default {
  getDocumentAsync,
  __setMockResult,
  __resetMock,
};
