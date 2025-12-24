"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useStores, useChatWithDocuments } from "@/lib/hooks";
import { CHAT_MODELS, type ChatModel, type FileSearchStore } from "@/lib/types";
import {
  XIcon,
  SendIcon,
  SpinnerIcon,
  SparklesIcon,
  StopIcon,
  FolderIcon,
} from "./Icons";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialStoreId?: string;
}

function getStoreId(name: string): string {
  return name.replace("fileSearchStores/", "");
}

export function ChatPanel({ isOpen, onClose, initialStoreId }: ChatPanelProps) {
  const [selectedModel, setSelectedModel] =
    useState<ChatModel>("gemini-2.5-flash");
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    initialStoreId || ""
  );
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: stores, isLoading: isLoadingStores } = useStores();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelRequest,
  } = useChatWithDocuments();

  // Update selected store when initialStoreId changes
  useEffect(() => {
    if (initialStoreId) {
      setSelectedStoreId(initialStoreId);
    }
  }, [initialStoreId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedStoreId || isLoading) return;
    sendMessage(inputValue, selectedModel, selectedStoreId);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const selectedStore = stores?.find(
    (s) => getStoreId(s.name) === selectedStoreId
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl h-[85vh] mx-4 bg-[#0a0a14] border border-[#2a2a4e] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#2a2a4e] bg-[#12121f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                Chat with Documents
              </h2>
              <p className="text-xs text-gray-500">
                Ask questions about your library
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#2a2a4e] text-gray-400 hover:text-gray-200 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Selectors */}
        <div className="flex-shrink-0 flex gap-4 px-6 py-4 border-b border-[#2a2a4e] bg-[#0f0f1a]">
          {/* Model Selector */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as ChatModel)}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#6366f1] transition-colors"
            >
              {CHAT_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* Library Selector */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Library
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value);
                clearMessages();
              }}
              disabled={isLoadingStores}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#6366f1] transition-colors disabled:opacity-50"
            >
              <option value="">Select a library...</option>
              {stores?.map((store: FileSearchStore) => (
                <option key={store.name} value={getStoreId(store.name)}>
                  {store.displayName || getStoreId(store.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {!selectedStoreId ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center mb-4">
                <FolderIcon className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-gray-300 font-medium mb-2">
                Select a Library
              </h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Choose a library from the dropdown above to start chatting with
                your documents
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 flex items-center justify-center mb-4">
                <SparklesIcon className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-gray-300 font-medium mb-2">
                Start a Conversation
              </h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Ask questions about the documents in{" "}
                <span className="text-indigo-400 font-medium">
                  {selectedStore?.displayName || selectedStoreId}
                </span>
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#6366f1] text-white"
                        : "bg-[#1a1a2e] border border-[#2a2a4e] text-gray-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content || (
                        <span className="flex items-center gap-2 text-gray-400">
                          <SpinnerIcon className="w-4 h-4" />
                          Thinking...
                        </span>
                      )}
                    </div>

                    {/* Grounding citations */}
                    {message.groundingMetadata?.groundingChunks &&
                      message.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#2a2a4e]">
                          <p className="text-xs text-gray-400 mb-2">Sources:</p>
                          <div className="space-y-1">
                            {message.groundingMetadata.groundingChunks.map(
                              (chunk, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-indigo-400 bg-[#12121f] rounded px-2 py-1"
                                >
                                  {chunk.retrievedContext?.documentUri ||
                                    chunk.web?.title ||
                                    `Source ${idx + 1}`}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse rounded-sm" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 px-6 py-4 border-t border-[#2a2a4e] bg-[#0f0f1a]"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedStoreId
                    ? "Ask a question about your documents..."
                    : "Select a library first"
                }
                disabled={!selectedStoreId || isLoading}
                rows={1}
                className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#6366f1] resize-none disabled:opacity-50 transition-colors"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>

            {isLoading ? (
              <button
                type="button"
                onClick={cancelRequest}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
              >
                <StopIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!selectedStoreId || !inputValue.trim()}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] disabled:bg-[#2a2a4e] disabled:text-gray-500 text-white flex items-center justify-center transition-colors"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Clear button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear conversation
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
