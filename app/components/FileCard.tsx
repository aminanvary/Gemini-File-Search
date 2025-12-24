"use client";

import { useDrag } from "react-dnd";
import { DragTypes, type GeminiFile } from "@/lib/types";
import { FileIcon, TrashIcon, DragIcon, SpinnerIcon } from "./Icons";
import { useDeleteFile } from "@/lib/hooks";
import { toast } from "sonner";

interface FileCardProps {
  file: GeminiFile;
}

function formatBytes(bytes: string | undefined): string {
  if (!bytes) return "Unknown size";
  const num = parseInt(bytes, 10);
  if (num === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileId(name: string): string {
  return name.replace("files/", "");
}

function getMimeTypeColor(mimeType: string | undefined): string {
  if (!mimeType) return "bg-gray-500/20 text-gray-400";
  if (mimeType.startsWith("image/")) return "bg-purple-500/20 text-purple-400";
  if (mimeType.startsWith("video/")) return "bg-pink-500/20 text-pink-400";
  if (mimeType.startsWith("audio/")) return "bg-green-500/20 text-green-400";
  if (mimeType.includes("pdf")) return "bg-red-500/20 text-red-400";
  if (mimeType.includes("text") || mimeType.includes("json"))
    return "bg-blue-500/20 text-blue-400";
  return "bg-gray-500/20 text-gray-400";
}

export function FileCard({ file }: FileCardProps) {
  const deleteFile = useDeleteFile();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DragTypes.FILE,
      item: { type: DragTypes.FILE, file },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [file]
  );

  const handleDelete = () => {
    const fileId = getFileId(file.name);
    deleteFile.mutate(fileId, {
      onSuccess: () => {
        toast.success(`Deleted ${file.displayName || fileId}`);
      },
      onError: () => {
        toast.error("Failed to delete file");
      },
    });
  };

  const mimeShort = file.mimeType?.split("/")[1]?.toUpperCase() || "FILE";

  return (
    <div
      ref={drag}
      className={`
        group relative bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4
        hover:border-[#6366f1]/50 hover:bg-[#1f1f35] cursor-grab
        transition-all duration-200 animate-fade-in
        ${isDragging ? "opacity-50 cursor-grabbing scale-95" : ""}
      `}
    >
      {/* Drag indicator */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
        <DragIcon className="w-4 h-4 text-gray-500" />
      </div>

      <div className="flex items-start gap-3 pl-4">
        {/* File icon with type badge */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${getMimeTypeColor(file.mimeType)}`}
          >
            <FileIcon className="w-6 h-6" />
          </div>
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-100 truncate">
            {file.displayName || getFileId(file.name)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${getMimeTypeColor(file.mimeType)}`}
            >
              {mimeShort}
            </span>
            <span className="text-xs text-gray-500">
              {formatBytes(file.sizeBytes)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(file.createTime)}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleteFile.isPending}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
          title="Delete file"
        >
          {deleteFile.isPending ? (
            <SpinnerIcon className="w-4 h-4" />
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Drag hint */}
      {file.state === "ACTIVE" && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
          <span className="text-[10px] text-gray-500">Drag to library</span>
        </div>
      )}
    </div>
  );
}

export function FileCardSkeleton() {
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4e] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="h-3 w-1/2 rounded skeleton" />
          <div className="h-3 w-1/3 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}



