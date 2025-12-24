export interface FileSearchStore {
  name: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface StoreDocument {
  name: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface GeminiFile {
  name: string;
  displayName?: string;
  mimeType?: string;
  sizeBytes?: string;
  createTime?: string;
  updateTime?: string;
  uri?: string;
  state?: string;
}

export interface StoreWithDocuments extends FileSearchStore {
  documents: StoreDocument[];
  isLoadingDocuments?: boolean;
}

// Drag and drop types
export const DragTypes = {
  FILE: "file",
} as const;

export interface DragItem {
  type: typeof DragTypes.FILE;
  file: GeminiFile;
}

// Chat types
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    documentUri?: string;
    snippet?: string;
  };
}

export interface GroundingSupport {
  groundingChunkIndices?: number[];
  confidenceScore?: number;
  segment?: {
    startIndex?: number;
    endIndex?: number;
    text?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  webSearchQueries?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  groundingMetadata?: GroundingMetadata;
  isStreaming?: boolean;
}

export type ChatModel = "gemini-2.5-flash" | "gemini-3-flash-preview";

export const CHAT_MODELS: { value: ChatModel; label: string }[] = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
];
