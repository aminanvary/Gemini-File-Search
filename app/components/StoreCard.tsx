"use client";

import { useState } from "react";
import { useDrop } from "react-dnd";
import {
  DragTypes,
  type FileSearchStore,
  type DragItem,
  type StoreDocument,
} from "@/lib/types";
import {
  FolderIcon,
  TrashIcon,
  ChevronDownIcon,
  DocumentIcon,
  SpinnerIcon,
  ChatIcon,
} from "./Icons";
import {
  useDeleteStore,
  useDocuments,
  useImportFile,
  useDeleteDocument,
} from "@/lib/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

interface StoreCardProps {
  store: FileSearchStore;
  onOpenChat?: (storeId: string) => void;
}

function getStoreId(name: string): string {
  return name.replace("fileSearchStores/", "");
}

function getDocumentId(name: string): string {
  const parts = name.split("/");
  return parts[parts.length - 1];
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function StoreCard({ store, onOpenChat }: StoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const storeId = getStoreId(store.name);

  const deleteStore = useDeleteStore();
  const deleteDocument = useDeleteDocument();
  const importFile = useImportFile();
  const { data: documents, isLoading: isLoadingDocuments } = useDocuments(
    storeId
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DragTypes.FILE,
      drop: (item: DragItem) => {
        const fileName = item.file.name;
        importFile.mutate(
          { storeId, fileName },
          {
            onSuccess: () => {
              toast.success(
                `Imported "${item.file.displayName}" to "${store.displayName}"`
              );
              setIsExpanded(true);
            },
            onError: () => {
              toast.error("Failed to import file");
            },
          }
        );
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [storeId, store.displayName]
  );

  const handleDeleteStore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `Delete library "${store.displayName}"? This will remove all documents.`
      )
    ) {
      deleteStore.mutate(storeId, {
        onSuccess: () => {
          toast.success(`Deleted library "${store.displayName}"`);
        },
        onError: () => {
          toast.error("Failed to delete library");
        },
      });
    }
  };

  const handleDeleteDocument = (doc: StoreDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    const docId = getDocumentId(doc.name);
    deleteDocument.mutate(
      { storeId, documentId: docId },
      {
        onSuccess: () => {
          toast.success(`Removed "${doc.displayName}" from library`);
        },
        onError: () => {
          toast.error("Failed to remove document");
        },
      }
    );
  };

  const isDropTarget = canDrop || isOver;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "group/card relative rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in",
        "bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)]/50",
        "shadow-[var(--neu-raised)] border",
        isOver
          ? "border-[var(--accent-hover)] shadow-[var(--neu-float),0_0_30px_rgba(245,158,11,0.25)] scale-[1.02]"
          : canDrop
            ? "border-[var(--accent-primary)] shadow-[var(--neu-raised),0_0_20px_rgba(245,158,11,0.15)]"
            : "border-[var(--border)]/50 hover:border-[var(--accent-primary)]/30 hover:shadow-[var(--neu-float)]",
        importFile.isPending && "animate-pulse-glow"
      )}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative flex items-center gap-4 p-5 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-[var(--bg-surface)]/60 hover:to-transparent"
      >
        {/* Accent line on hover */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-r-full transition-all duration-300 group-hover:h-10 opacity-0 group-hover:opacity-100" />
        
        {/* Folder icon with gradient background */}
        <div
          className={cn(
            "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
            "bg-gradient-to-br from-[var(--accent-primary)]/25 via-[var(--accent-secondary)]/20 to-[var(--accent-primary)]/10",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.3)]",
            "border border-[var(--accent-primary)]/20",
            isDropTarget
              ? "scale-110 shadow-[0_0_24px_rgba(245,158,11,0.4)] border-[var(--accent-hover)]"
              : "group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          )}
        >
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
          {importFile.isPending ? (
            <SpinnerIcon className="w-5 h-5 text-[var(--accent-hover)] relative z-10" />
          ) : (
            <FolderIcon className={cn(
              "w-5 h-5 relative z-10 transition-all duration-300",
              isDropTarget ? "text-[var(--accent-hover)]" : "text-[var(--accent-primary)] group-hover:text-[var(--accent-hover)]"
            )} />
          )}
        </div>

        {/* Store info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate tracking-tight group-hover:text-[var(--accent-hover)] transition-colors">
              {store.displayName || storeId}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {/* Document count badge */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]">
              <DocumentIcon className="w-3 h-3 text-[var(--accent-primary)]/70" />
              <span className="font-medium">{documents?.length ?? "..."}</span>
            </span>
            <span className="text-[var(--text-secondary)]">•</span>
            <span className="text-[var(--text-secondary)]">{formatDate(store.createTime)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat?.(storeId);
            }}
            className="h-8 w-8 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/15 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            title="Chat with documents"
          >
            <ChatIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteStore}
            disabled={deleteStore.isPending}
            className="h-8 w-8 rounded-xl text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/15"
            title="Delete library"
          >
            {deleteStore.isPending ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Chevron - always visible */}
        <ChevronDownIcon
          className={cn(
            "w-5 h-5 text-[var(--text-muted)] transition-all duration-300 group-hover:text-[var(--text-secondary)]",
            isExpanded && "rotate-180 text-[var(--accent-primary)]"
          )}
        />
      </div>

      {/* Drop indicator */}
      {isDropTarget && (
        <div className="px-5 pb-4 animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent border border-[var(--accent-primary)]/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-hover)]"></span>
            </span>
            <span className="text-xs font-medium text-[var(--accent-hover)]">Drop to import file</span>
          </div>
        </div>
      )}

      {/* Documents list */}
      {isExpanded && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-base)]">
          {isLoadingDocuments ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-lg skeleton" />
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="divide-y divide-[var(--border)]">
              {documents.map((doc) => (
                <li
                  key={doc.name}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] group transition-colors"
                >
                  <DocumentIcon className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-sm text-[var(--text-secondary)] truncate flex-1 group-hover:text-[var(--text-primary)]">
                    {doc.displayName || getDocumentId(doc.name)}
                  </span>
                  <button
                    onClick={(e) => handleDeleteDocument(doc, e)}
                    className="p-1.5 rounded-lg hover:bg-[var(--danger)]/10 text-[var(--text-muted)] hover:text-[var(--danger)] transition-all opacity-0 group-hover:opacity-100"
                    title="Remove document"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-[var(--text-muted)] text-sm">No documents yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 opacity-70">
                Drag files here to import them
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded skeleton" />
          <div className="h-3 w-1/3 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}
