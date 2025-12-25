"use client";

import { useState } from "react";
import { useStores, useFiles } from "@/lib/hooks";
import { StoreCard, StoreCardSkeleton } from "./components/StoreCard";
import { FileCard, FileCardSkeleton } from "./components/FileCard";
import { UploadZone } from "./components/UploadZone";
import {
  CreateStoreButton,
  CreateStoreModal,
} from "./components/CreateStoreModal";
import { ChatPanel } from "./components/ChatPanel";
import { FolderIcon, FileIcon, ChatIcon } from "./components/Icons";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStoreId, setChatStoreId] = useState<string | undefined>(undefined);

  const handleOpenChat = (storeId?: string) => {
    setChatStoreId(storeId);
    setIsChatOpen(true);
  };

  const {
    data: stores,
    isLoading: isLoadingStores,
    error: storesError,
  } = useStores();

  const {
    data: files,
    isLoading: isLoadingFiles,
    error: filesError,
  } = useFiles();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-[var(--neu-raised),0_4px_20px_rgba(245,158,11,0.3)]">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                  Gemini File Search
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  Visualize and manage your libraries & files
                </p>
              </div>
            </div>
            {/* Chat button in header - centered */}
            <div className="flex-1 flex justify-center">
              <Button
                onClick={() => handleOpenChat()}
                variant="neumorphic-glow"
                className="gap-3 px-7 py-3.5 h-auto text-base font-semibold"
              >
                <ChatIcon className="w-5 h-5" />
                <span>Chat</span>
              </Button>
            </div>
            <div className="w-[200px]"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Libraries */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FolderIcon className="w-6 h-6 text-[var(--accent-primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Libraries
                </h2>
                {stores && (
                  <Badge variant="secondary">
                    {stores.length}
                  </Badge>
                )}
              </div>
              <CreateStoreButton onClick={() => setIsCreateModalOpen(true)} />
            </div>

            {storesError ? (
              <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-2xl p-6 text-center shadow-[var(--neu-raised)]">
                <p className="text-[var(--danger)] text-sm">
                  Failed to load libraries. Make sure your GEMINI_API_KEY is set.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : isLoadingStores ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <StoreCardSkeleton key={i} />
                ))}
              </div>
            ) : stores && stores.length > 0 ? (
              <div className="space-y-4">
                {stores.map((store) => (
                  <StoreCard
                    key={store.name}
                    store={store}
                    onOpenChat={handleOpenChat}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-surface)] shadow-[var(--neu-inset)] flex items-center justify-center">
                  <FolderIcon className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-[var(--text-primary)] font-medium mb-2">
                  No libraries yet
                </h3>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  Create a library to organize your documents
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create Library
                </Button>
              </div>
            )}

            {/* Drop zone hint */}
            {stores && stores.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/10 border-2 border-dashed border-[var(--accent-primary)]/50 rounded-2xl flex items-center justify-center gap-3">
                <svg className="w-5 h-5 text-[var(--accent-primary)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Drag files from the right panel and drop them onto a library to import
                </p>
              </div>
            )}
          </section>

          {/* Right Panel - Files */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileIcon className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Uploaded Files
              </h2>
              {files && (
                <Badge variant="success">
                  {files.length}
                </Badge>
              )}
            </div>

            {/* Upload zone */}
            <div className="mb-6">
              <UploadZone />
            </div>

            {filesError ? (
              <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-2xl p-6 text-center shadow-[var(--neu-raised)]">
                <p className="text-[var(--danger)] text-sm">Failed to load files.</p>
                <Button
                  variant="destructive"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : isLoadingFiles ? (
              <div className="relative rounded-2xl bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] p-4 border border-[var(--border)]/50">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <FileCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : files && files.length > 0 ? (
              <div className="relative rounded-2xl bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-base)] shadow-[var(--neu-raised)] border border-[var(--border)]/50 overflow-hidden">
                {/* Decorative header bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/80 via-teal-400/60 to-emerald-500/80" />
                
                {/* File count summary */}
                <div className="px-5 py-4 border-b border-[var(--border)]/30 bg-[var(--bg-surface)]/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      {files.length} {files.length === 1 ? 'file' : 'files'} available
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400">Ready to use</span>
                    </div>
                  </div>
                </div>
                
                {/* Scrollable file list */}
                <div className="max-h-[calc(100vh-440px)] overflow-y-auto scrollbar-thin p-3">
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={file.name}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-fade-in opacity-0"
                      >
                        <FileCard file={file} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bottom fade gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--bg-base)] to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] rounded-2xl p-12 text-center border border-[var(--border)]/50">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-surface)] shadow-[var(--neu-inset)] flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-[var(--text-primary)] font-medium mb-2">No files yet</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  Upload files to get started. They can then be added to libraries.
                </p>
              </div>
            )}

            {/* File info */}
            {files && files.length > 0 && (
              <div className="mt-4 text-xs text-[var(--text-muted)] text-center">
                Files are automatically deleted after 48 hours
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Create Store Modal */}
      <CreateStoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialStoreId={chatStoreId}
      />
    </div>
  );
}
