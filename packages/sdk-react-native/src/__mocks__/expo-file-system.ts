/**
 * Mock expo-file-system/legacy for testing.
 */

export interface FileInfo {
  exists: boolean;
  uri?: string;
  size?: number;
  modificationTime?: number;
  isDirectory?: boolean;
}

const mockFileInfo: Map<string, FileInfo> = new Map();

export async function getInfoAsync(uri: string): Promise<FileInfo> {
  return mockFileInfo.get(uri) ?? { exists: false };
}

export interface UploadProgressData {
  totalBytesSent: number;
  totalBytesExpectedToSend: number;
}

export interface FileSystemUploadResult {
  status: number;
  body?: string;
}

export async function uploadAsync(
  _url: string,
  _fileUri: string,
  _options?: {
    httpMethod?: string;
    uploadType?: string;
    headers?: Record<string, string>;
  }
): Promise<FileSystemUploadResult> {
  return { status: 200 };
}

// Constants
export const FileSystemUploadType = {
  BINARY_CONTENT: "binaryContent",
  MULTIPART: "multipart",
};

// Helper to set mock file info for tests
export function __setMockFileInfo(uri: string, info: FileInfo): void {
  mockFileInfo.set(uri, info);
}

export function __resetMock(): void {
  mockFileInfo.clear();
}

export default {
  getInfoAsync,
  uploadAsync,
  FileSystemUploadType,
  __setMockFileInfo,
  __resetMock,
};
