"use client";

import { useCallback, useState } from "react";
import { UploadIcon, SpinnerIcon } from "./Icons";
import { useUploadFile } from "@/lib/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const uploadFile = useUploadFile();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      // Upload all files
      files.forEach((file) => {
        uploadFile.mutate(file, {
          onSuccess: () => {
            toast.success(`Uploaded "${file.name}"`);
          },
          onError: () => {
            toast.error(`Failed to upload "${file.name}"`);
          },
        });
      });
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        uploadFile.mutate(file, {
          onSuccess: () => {
            toast.success(`Uploaded "${file.name}"`);
          },
          onError: () => {
            toast.error(`Failed to upload "${file.name}"`);
          },
        });
      });
      // Reset input
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
        "bg-[var(--bg-base)] shadow-[var(--neu-inset)]",
        isDraggingOver
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 shadow-[var(--neu-inset),0_0_30px_rgba(245,158,11,0.15)]"
          : "border-[var(--border)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-elevated)]/50"
      )}
    >
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center gap-4">
        {uploadFile.isPending ? (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--accent-primary)]/20 animate-pulse-glow">
              <SpinnerIcon className="w-7 h-7 text-[var(--accent-primary)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Uploading...</p>
          </>
        ) : (
          <>
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                "shadow-[var(--neu-raised)]",
                isDraggingOver
                  ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] scale-110"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              )}
            >
              <UploadIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)]">
                Drop files here or{" "}
                <span className="text-[var(--accent-primary)] font-medium hover:text-[var(--accent-hover)] transition-colors">
                  browse
                </span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">
                Supports text, PDF, images, audio, and video files
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
