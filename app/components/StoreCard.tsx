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
    isExpanded ? storeId : null
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
        "rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in",
        "bg-[var(--bg-elevated)] shadow-[var(--neu-raised)] border",
        isOver
          ? "border-[var(--accent-hover)] shadow-[var(--neu-float),0_0_30px_rgba(245,158,11,0.2)] bg-[var(--accent-primary)]/5"
          : canDrop
            ? "border-[var(--accent-primary)] shadow-[var(--neu-raised),0_0_20px_rgba(245,158,11,0.1)]"
            : "border-transparent hover:border-[var(--accent-primary)]/20",
        importFile.isPending && "animate-pulse-glow"
      )}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--bg-surface)]/50 transition-colors"
      >
        {/* Folder icon */}
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300",
            "shadow-[var(--neu-subtle)]",
            isDropTarget
              ? "bg-[var(--accent-primary)]/30 text-[var(--accent-hover)] scale-110"
              : "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
          )}
        >
          {importFile.isPending ? (
            <SpinnerIcon className="w-5 h-5" />
          ) : (
            <FolderIcon className="w-5 h-5" />
          )}
        </div>

        {/* Store info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
            {store.displayName || storeId}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            {documents?.length ?? "..."} documents • {formatDate(store.createTime)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat?.(storeId);
            }}
            className="opacity-60 hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
            title="Chat with documents"
          >
            <ChatIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteStore}
            disabled={deleteStore.isPending}
            className="opacity-60 hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10"
            title="Delete library"
          >
            {deleteStore.isPending ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </Button>
          <ChevronDownIcon
            className={cn(
              "w-5 h-5 text-[var(--text-muted)] transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Drop indicator */}
      {isDropTarget && (
        <div className="px-4 pb-3">
          <div className="text-xs text-[var(--accent-primary)] flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
            Drop to import file
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
