"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useStores, useChatWithDocuments } from "@/lib/hooks";
import { CHAT_MODELS, type ChatModel, type FileSearchStore } from "@/lib/types";
import {
  XIcon,
  SendIcon,
  SpinnerIcon,
  ChatIconFancy,
  ChatIconSolid,
  StopIcon,
  FolderIcon,
} from "./Icons";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { cn, isPersianText } from "@/lib/utils";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-[var(--neu-raised),0_4px_20px_rgba(245,158,11,0.3)]">
              <ChatIconSolid className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
                Chat with Documents
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--text-secondary)]">
                Ask questions about your library
              </DialogDescription>
            </div>
          </div>
          <DialogClose className="p-2 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-[var(--neu-subtle)]">
            <XIcon className="w-5 h-5" />
          </DialogClose>
        </header>

        {/* Selectors */}
        <div className="flex-shrink-0 flex gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          {/* Model Selector */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={(v) => setSelectedModel(v as ChatModel)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAT_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Library Selector */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
              Library
            </label>
            <Select
              value={selectedStoreId}
              onValueChange={(v) => {
                setSelectedStoreId(v);
                clearMessages();
              }}
              disabled={isLoadingStores}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a library..." />
              </SelectTrigger>
              <SelectContent>
                {stores?.map((store: FileSearchStore) => (
                  <SelectItem key={store.name} value={getStoreId(store.name)}>
                    {store.displayName || getStoreId(store.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[var(--bg-base)]">
          {!selectedStoreId ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] flex items-center justify-center mb-4">
                <FolderIcon className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-medium mb-2">
                Select a Library
              </h3>
              <p className="text-[var(--text-muted)] text-sm max-w-xs">
                Choose a library from the dropdown above to start chatting with
                your documents
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 shadow-[var(--neu-raised)] flex items-center justify-center mb-4 animate-float">
                <ChatIconFancy className="w-8 h-8" />
              </div>
              <h3 className="text-[var(--text-primary)] font-medium mb-2">
                Start a Conversation
              </h3>
              <p className="text-[var(--text-muted)] text-sm max-w-xs">
                Ask questions about the documents in{" "}
                <span className="text-[var(--accent-primary)] font-medium">
                  {selectedStore?.displayName || selectedStoreId}
                </span>
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-gradient-to-br from-amber-600/80 to-amber-700/90 text-amber-50 shadow-[var(--neu-raised)] border border-amber-500/20"
                        : "bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] border border-[var(--border)] text-[var(--text-primary)]"
                    )}
                  >
                    <div
                      className={cn(
                        "whitespace-pre-wrap text-sm leading-relaxed",
                        isPersianText(message.content || "") && "font-persian"
                      )}
                      dir={isPersianText(message.content || "") ? "rtl" : "ltr"}
                    >
                      {message.content || (
                        <span className="flex items-center gap-2 text-[var(--text-muted)]">
                          <SpinnerIcon className="w-4 h-4" />
                          Thinking...
                        </span>
                      )}
                    </div>

                    {/* Grounding citations */}
                    {message.groundingMetadata?.groundingChunks &&
                      message.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]">
                          <p className="text-xs text-[var(--text-muted)] mb-2">
                            Sources:
                          </p>
                          <div className="space-y-1">
                            {message.groundingMetadata.groundingChunks.map(
                              (chunk, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs text-[var(--accent-primary)] bg-[var(--bg-base)] rounded-lg px-2 py-1 shadow-[var(--neu-subtle)]"
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
                      <span className="inline-block w-2 h-4 ml-1 bg-[var(--accent-primary)] animate-pulse rounded-sm" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}

          {error && (
            <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl p-4 text-center shadow-[var(--neu-subtle)]">
              <p className="text-[var(--danger)] text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-elevated)]"
        >
          <div className="flex items-stretch gap-3">
            <div className="flex-1 relative flex">
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
                dir={isPersianText(inputValue) ? "rtl" : "ltr"}
                className={cn(
                  "w-full px-4 py-3 rounded-2xl text-sm resize-none transition-all duration-200",
                  "bg-[var(--bg-base)] shadow-[var(--neu-inset)]",
                  "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30",
                  "disabled:opacity-50",
                  "min-h-[52px]",
                  isPersianText(inputValue) && "font-persian"
                )}
                style={{ maxHeight: "120px" }}
              />
            </div>

            {isLoading ? (
              <button
                type="button"
                onClick={cancelRequest}
                className="group relative w-[52px] h-[52px] rounded-2xl flex-shrink-0
                  bg-gradient-to-br from-rose-500 to-red-600
                  shadow-[var(--neu-raised),0_4px_16px_rgba(239,68,68,0.3)]
                  hover:shadow-[var(--neu-raised),0_6px_24px_rgba(239,68,68,0.4)]
                  hover:scale-105 active:scale-95
                  transition-all duration-200 ease-out
                  flex items-center justify-center"
              >
                <StopIcon className="w-5 h-5 text-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!selectedStoreId || !inputValue.trim()}
                className={cn(
                  "group relative w-[52px] h-[52px] rounded-2xl flex-shrink-0",
                  "bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]",
                  "shadow-[var(--neu-raised),0_4px_16px_rgba(245,158,11,0.3)]",
                  "hover:shadow-[var(--neu-raised),0_6px_24px_rgba(245,158,11,0.4)]",
                  "hover:scale-105 active:scale-95",
                  "transition-all duration-200 ease-out",
                  "flex items-center justify-center",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-[var(--neu-raised)]"
                )}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/0 to-orange-500/0 
                  group-hover:from-amber-400/20 group-hover:to-orange-500/20 transition-all duration-300" />
                <SendIcon className="w-5 h-5 text-white relative z-10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
          </div>

          {/* Clear button */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="mt-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Clear conversation
            </button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
