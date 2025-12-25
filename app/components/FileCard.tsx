"use client";

import { useDrag } from "react-dnd";
import { DragTypes, type GeminiFile } from "@/lib/types";
import { FileIcon, TrashIcon, DragIcon, SpinnerIcon } from "./Icons";
import { useDeleteFile } from "@/lib/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

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

function getMimeTypeColor(mimeType: string | undefined): {
  bg: string;
  text: string;
} {
  if (!mimeType)
    return { bg: "bg-[var(--bg-surface)]", text: "text-[var(--text-muted)]" };
  if (mimeType.startsWith("image/"))
    return { bg: "bg-amber-500/20", text: "text-amber-400" };
  if (mimeType.startsWith("video/"))
    return { bg: "bg-rose-500/20", text: "text-rose-400" };
  if (mimeType.startsWith("audio/"))
    return { bg: "bg-emerald-500/20", text: "text-emerald-400" };
  if (mimeType.includes("pdf"))
    return { bg: "bg-red-500/20", text: "text-red-400" };
  if (mimeType.includes("text") || mimeType.includes("json"))
    return { bg: "bg-sky-500/20", text: "text-sky-400" };
  return { bg: "bg-[var(--bg-surface)]", text: "text-[var(--text-muted)]" };
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
  const mimeColors = getMimeTypeColor(file.mimeType);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "group relative rounded-xl cursor-grab transition-all duration-300",
        "bg-gradient-to-r from-[var(--bg-surface)]/80 to-[var(--bg-surface)]/40",
        "border border-[var(--border)]/40",
        "hover:from-[var(--bg-surface)] hover:to-[var(--bg-surface)]/60",
        "hover:border-[var(--border)]/70 hover:shadow-lg hover:shadow-black/20",
        isDragging && "opacity-50 cursor-grabbing scale-[0.98] border-[var(--accent-primary)]/50"
      )}
    >
      {/* Left accent bar based on file type */}
      <div className={cn(
        "absolute left-0 top-2 bottom-2 w-1 rounded-full transition-all duration-300",
        mimeColors.bg,
        "group-hover:top-1 group-hover:bottom-1 group-hover:w-1.5"
      )} />

      <div className="flex items-center gap-4 p-3 pl-5">
        {/* File icon with type indicator */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "w-11 h-11 rounded-lg flex items-center justify-center",
              "bg-[var(--bg-base)]/60 border border-[var(--border)]/30",
              "group-hover:border-[var(--border)]/50 transition-colors",
              mimeColors.text
            )}
          >
            <FileIcon className="w-5 h-5" />
          </div>
          {/* Type indicator dot */}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center",
            "text-[8px] font-bold uppercase tracking-tighter",
            mimeColors.bg,
            mimeColors.text,
            "border-2 border-[var(--bg-surface)]"
          )}>
            {mimeShort.charAt(0)}
          </div>
        </div>

        {/* File info - compact layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate flex-1">
              {file.displayName || getFileId(file.name)}
            </h3>
            {/* Drag indicator */}
            <div className="opacity-0 group-hover:opacity-60 transition-opacity flex items-center gap-1">
              <DragIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              mimeColors.bg,
              mimeColors.text
            )}>
              {mimeShort}
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              {formatBytes(file.sizeBytes)}
            </span>
            <span className="text-xs text-[var(--text-muted)]/70 flex items-center gap-1">
              <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(file.createTime)}
            </span>
          </div>
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleteFile.isPending}
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
        >
          {deleteFile.isPending ? (
            <SpinnerIcon className="w-4 h-4" />
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function FileCardSkeleton() {
  return (
    <div className="relative rounded-xl bg-gradient-to-r from-[var(--bg-surface)]/50 to-[var(--bg-surface)]/20 border border-[var(--border)]/30">
      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full skeleton" />
      <div className="flex items-center gap-4 p-3 pl-5">
        <div className="w-11 h-11 rounded-lg skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded skeleton" />
          <div className="flex gap-3">
            <div className="h-5 w-12 rounded skeleton" />
            <div className="h-4 w-16 rounded skeleton" />
            <div className="h-4 w-24 rounded skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
