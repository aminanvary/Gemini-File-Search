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



