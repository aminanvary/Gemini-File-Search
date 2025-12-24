"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  FileSearchStore,
  StoreDocument,
  GeminiFile,
  ChatMessage,
  ChatModel,
  GroundingMetadata,
} from "./types";

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

// Chat with Documents
export function useChatWithDocuments() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string, model: ChatModel, storeId: string) => {
      if (!message.trim() || isLoading) return;

      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };

      // Add placeholder for model response
      const modelMessageId = `model-${Date.now()}`;
      const modelMessage: ChatMessage = {
        id: modelMessageId,
        role: "model",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, modelMessage]);
      setIsLoading(true);

      // Build history from previous messages for context
      const history = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, model, storeId, history }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";
        let groundingMetadata: GroundingMetadata | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n").filter((line) => line.startsWith("data: "));

          for (const line of lines) {
            const jsonStr = line.replace("data: ", "");
            try {
              const data = JSON.parse(jsonStr);

              if (data.type === "text") {
                accumulatedContent += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === modelMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (data.type === "grounding") {
                groundingMetadata = data.content;
              } else if (data.type === "error") {
                throw new Error(data.content);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }

        // Finalize the message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMessageId
              ? {
                  ...msg,
                  content: accumulatedContent,
                  groundingMetadata,
                  isStreaming: false,
                }
              : msg
          )
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled
          setMessages((prev) => prev.filter((msg) => msg.id !== modelMessageId));
        } else {
          const errorMessage = err instanceof Error ? err.message : "An error occurred";
          setError(errorMessage);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMessageId
                ? {
                    ...msg,
                    content: `Error: ${errorMessage}`,
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
  };
}

