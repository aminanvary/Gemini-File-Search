"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FileSearchStore, StoreDocument, GeminiFile } from "./types";

// Stores
export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async (): Promise<FileSearchStore[]> => {
      const res = await fetch("/api/stores");
      if (!res.ok) throw new Error("Failed to fetch stores");
      const data = await res.json();
      return data.stores;
    },
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (displayName: string) => {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) throw new Error("Failed to create store");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeId: string) => {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete store");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

// Documents
export function useDocuments(storeId: string | null) {
  return useQuery({
    queryKey: ["documents", storeId],
    queryFn: async (): Promise<StoreDocument[]> => {
      if (!storeId) return [];
      const res = await fetch(`/api/stores/${storeId}/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      return data.documents;
    },
    enabled: !!storeId,
  });
}

export function useImportFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      fileName,
    }: {
      storeId: string;
      fileName: string;
    }) => {
      const res = await fetch(`/api/stores/${storeId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });
      if (!res.ok) throw new Error("Failed to import file");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.storeId],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      documentId,
    }: {
      storeId: string;
      documentId: string;
    }) => {
      const res = await fetch(
        `/api/stores/${storeId}/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete document");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.storeId],
      });
    },
  });
}

// Files
export function useFiles() {
  return useQuery({
    queryKey: ["files"],
    queryFn: async (): Promise<GeminiFile[]> => {
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      return data.files;
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}



