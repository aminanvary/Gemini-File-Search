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
      <header className="sticky top-0 z-40 border-b border-[#2a2a4e] bg-[#0a0a14]/90 backdrop-blur-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center">
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
                <h1 className="text-xl font-semibold text-gray-100">
                  Gemini File Search
                </h1>
                <p className="text-sm text-gray-500">
                  Visualize and manage your libraries & files
                </p>
              </div>
            </div>
            {/* Chat button in header - centered */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => handleOpenChat()}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#818cf8] hover:to-[#a78bfa] rounded-xl text-white text-base font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95"
              >
                <ChatIcon className="w-5 h-5" />
                <span>Chat</span>
              </button>
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
                <FolderIcon className="w-6 h-6 text-indigo-400" />
                <h2 className="text-lg font-semibold text-gray-100">
                  Libraries
                </h2>
                {stores && (
                  <span className="px-2 py-0.5 bg-[#2a2a4e] text-gray-400 text-xs rounded-full">
                    {stores.length}
                  </span>
                )}
              </div>
              <CreateStoreButton onClick={() => setIsCreateModalOpen(true)} />
            </div>

            {storesError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-red-400 text-sm">
                  Failed to load libraries. Make sure your GEMINI_API_KEY is set.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                >
                  Retry
                </button>
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
              <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2a4e] flex items-center justify-center">
                  <FolderIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-gray-300 font-medium mb-2">
                  No libraries yet
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Create a library to organize your documents
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-[#6366f1] hover:bg-[#818cf8] rounded-lg text-white text-sm font-medium transition-colors"
                >
                  Create Library
                </button>
              </div>
            )}

            {/* Drop zone hint */}
            {stores && stores.length > 0 && (
              <div className="mt-6 p-4 bg-[#12121f] border border-dashed border-[#2a2a4e] rounded-xl text-center">
                <p className="text-sm text-gray-500">
                  💡 Drag files from the right panel and drop them onto a library
                  to import
                </p>
              </div>
            )}
          </section>

          {/* Right Panel - Files */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileIcon className="w-6 h-6 text-emerald-400" />
              <h2 className="text-lg font-semibold text-gray-100">
                Uploaded Files
              </h2>
              {files && (
                <span className="px-2 py-0.5 bg-[#2a2a4e] text-gray-400 text-xs rounded-full">
                  {files.length}
                </span>
              )}
            </div>

            {/* Upload zone */}
            <div className="mb-6">
              <UploadZone />
            </div>

            {filesError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-red-400 text-sm">Failed to load files.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : isLoadingFiles ? (
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <FileCardSkeleton key={i} />
                ))}
              </div>
            ) : files && files.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
                {files.map((file) => (
                  <FileCard key={file.name} file={file} />
                ))}
              </div>
            ) : (
              <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2a4e] flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-gray-300 font-medium mb-2">No files yet</h3>
                <p className="text-gray-500 text-sm">
                  Upload files to get started. They can then be added to libraries.
                </p>
              </div>
            )}

            {/* File info */}
            {files && files.length > 0 && (
              <div className="mt-4 text-xs text-gray-500 text-center">
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
