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
} from "./Icons";
import { useDeleteStore, useDocuments, useImportFile, useDeleteDocument } from "@/lib/hooks";
import { toast } from "sonner";

interface StoreCardProps {
  store: FileSearchStore;
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

export function StoreCard({ store }: StoreCardProps) {
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
      ref={drop}
      className={`
        bg-[#1a1a2e] border rounded-xl overflow-hidden
        transition-all duration-200 animate-fade-in
        ${isOver ? "drop-hover border-[#818cf8]" : canDrop ? "drop-active border-[#6366f1]" : "border-[#2a2a4e]"}
        ${importFile.isPending ? "animate-pulse-glow" : ""}
      `}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-3 p-4 cursor-pointer hover:bg-[#1f1f35] transition-colors"
      >
        {/* Folder icon */}
        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${isDropTarget ? "bg-indigo-500/30 text-indigo-300" : "bg-indigo-500/20 text-indigo-400"}
            transition-colors
          `}
        >
          {importFile.isPending ? (
            <SpinnerIcon className="w-5 h-5" />
          ) : (
            <FolderIcon className="w-5 h-5" />
          )}
        </div>

        {/* Store info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-100 truncate">
            {store.displayName || storeId}
          </h3>
          <p className="text-xs text-gray-500">
            {documents?.length ?? "..."} documents • {formatDate(store.createTime)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteStore}
            disabled={deleteStore.isPending}
            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all opacity-60 hover:opacity-100"
            title="Delete library"
          >
            {deleteStore.isPending ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Drop indicator */}
      {isDropTarget && (
        <div className="px-4 pb-2">
          <div className="text-xs text-indigo-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Drop to import file
          </div>
        </div>
      )}

      {/* Documents list */}
      {isExpanded && (
        <div className="border-t border-[#2a2a4e] bg-[#12121f]">
          {isLoadingDocuments ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded skeleton" />
              ))}
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="divide-y divide-[#2a2a4e]">
              {documents.map((doc) => (
                <li
                  key={doc.name}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a2e] group"
                >
                  <DocumentIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {doc.displayName || getDocumentId(doc.name)}
                  </span>
                  <button
                    onClick={(e) => handleDeleteDocument(doc, e)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                    title="Remove document"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm">
              <p>No documents yet</p>
              <p className="text-xs mt-1">Drag files here to import them</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded skeleton" />
          <div className="h-3 w-1/3 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}



