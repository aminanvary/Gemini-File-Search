"use client";

import { useCallback, useState } from "react";
import { UploadIcon, SpinnerIcon } from "./Icons";
import { useUploadFile } from "@/lib/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UploadZone() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const uploadFile = useUploadFile();

  // Helper function to process directory entries recursively
  const processDirectoryEntry = async (
    entry: FileSystemEntry,
    path: string = ""
  ): Promise<File[]> => {
    const files: File[] = [];

    if (entry.isFile) {
      return new Promise((resolve, reject) => {
        (entry as FileSystemFileEntry).file(
          (file: File) => {
            const fileWithPath = new File([file], path ? `${path}/${file.name}` : file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });
            resolve([fileWithPath]);
          },
          (error: DOMException) => {
            reject(error);
          }
        );
      });
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
        const entries: FileSystemEntry[] = [];
        const readEntries = () => {
          dirReader.readEntries(
            (results) => {
              if (results.length === 0) {
                resolve(entries);
              } else {
                entries.push(...results);
                readEntries();
              }
            },
            (error) => {
              reject(error);
            }
          );
        };
        readEntries();
      });

      for (const subEntry of entries) {
        const subPath = path ? `${path}/${subEntry.name}` : subEntry.name;
        const subFiles = await processDirectoryEntry(subEntry, subPath);
        files.push(...subFiles);
      }
    }

    return files;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);

      const items = Array.from(e.dataTransfer.items);
      const files: File[] = [];

      // Check if any items are directories
      const hasDirectories = items.some(
        (item) => item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory
      );

      if (hasDirectories) {
        // Process directory drops
        for (const item of items) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            const entryFiles = await processDirectoryEntry(entry);
            files.push(...entryFiles);
          }
        }
      } else {
        // Process regular file drops
        const fileList = Array.from(e.dataTransfer.files);
        files.push(...fileList);
      }

      if (files.length === 0) return;

      setUploadingCount(files.length);
      const results = await Promise.allSettled(
        files.map((file) => uploadFile.mutateAsync(file))
      );
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const errorCount = results.filter((r) => r.status === "rejected").length;
      setUploadingCount(0);
      if (files.length > 1) {
        if (errorCount === 0) {
          toast.success(`Uploaded ${successCount} of ${files.length} files`);
        } else if (successCount === 0) {
          toast.error(`Failed to upload ${errorCount} of ${files.length} files`);
        } else {
          toast.warning(`Uploaded ${successCount} of ${files.length} files (${errorCount} failed)`);
        }
      } else if (successCount > 0) {
        toast.success(`Uploaded "${files[0].name}"`);
      } else {
        toast.error(`Failed to upload "${files[0].name}"`);
      }
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
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      setUploadingCount(files.length);

      // Upload all files, preserving folder structure in displayName
      const uploadPromises = files.map((file) => {
        // Use webkitRelativePath if available, otherwise use file.name
        const displayName = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
        
        // Create a new File with the displayName preserved
        const fileToUpload = new File([file], displayName, {
          type: file.type,
          lastModified: file.lastModified,
        });

        return uploadFile.mutateAsync(fileToUpload);
      });

      const results = await Promise.allSettled(uploadPromises);
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const errorCount = results.filter((r) => r.status === "rejected").length;
      setUploadingCount(0);
      if (files.length > 1) {
        if (errorCount === 0) {
          toast.success(`Uploaded ${successCount} of ${files.length} files`);
        } else if (successCount === 0) {
          toast.error(`Failed to upload ${errorCount} of ${files.length} files`);
        } else {
          toast.warning(`Uploaded ${successCount} of ${files.length} files (${errorCount} failed)`);
        }
      } else {
        const displayName = (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath || files[0].name;
        if (successCount > 0) {
          toast.success(`Uploaded "${displayName}"`);
        } else {
          toast.error(`Failed to upload "${displayName}"`);
        }
      }
      
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
        "relative rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden group",
        "bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-surface)] to-[var(--bg-elevated)]",
        "shadow-[6px_6px_16px_rgba(0,0,0,0.25),-4px_-4px_12px_rgba(255,255,255,0.03)]",
        "border border-[var(--border)]/60",
        "hover:shadow-[8px_8px_20px_rgba(0,0,0,0.3),-6px_-6px_16px_rgba(255,255,255,0.04),0_0_40px_rgba(245,158,11,0.08)]",
        "hover:translate-y-[-2px] hover:scale-[1.01]",
        isDraggingOver && "border-[var(--accent-primary)] shadow-[8px_8px_20px_rgba(0,0,0,0.3),-6px_-6px_16px_rgba(255,255,255,0.04),0_0_50px_rgba(245,158,11,0.2)] translate-y-[-3px] scale-[1.02]"
      )}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-[var(--accent-primary)]/30 rounded-tl-xl transition-all duration-300 group-hover:border-[var(--accent-primary)]/60" />
      <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-[var(--accent-primary)]/30 rounded-tr-xl transition-all duration-300 group-hover:border-[var(--accent-primary)]/60" />
      <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-[var(--accent-primary)]/30 rounded-bl-xl transition-all duration-300 group-hover:border-[var(--accent-primary)]/60" />
      <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-[var(--accent-primary)]/30 rounded-br-xl transition-all duration-300 group-hover:border-[var(--accent-primary)]/60" />
      
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/0 via-transparent to-[var(--accent-secondary)]/0 transition-opacity duration-300",
        isDraggingOver ? "opacity-100 from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/5" : "opacity-0 group-hover:opacity-100 group-hover:from-[var(--accent-primary)]/5 group-hover:to-[var(--accent-secondary)]/3"
      )} />

      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <label className="absolute bottom-4 right-4 z-20">
        <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-xs font-medium text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 shadow-sm hover:bg-[var(--accent-primary)]/20 transition-colors cursor-pointer">
          Upload folder
        </span>
        <input
          type="file"
          multiple
          {...({ webkitdirectory: true } as React.InputHTMLAttributes<HTMLInputElement>)}
          onChange={handleFileSelect}
          className="sr-only"
        />
      </label>

      <div className="relative flex flex-col items-center gap-5">
        {uploadFile.isPending || uploadingCount > 0 ? (
          <>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-primary)]/30 to-[var(--accent-secondary)]/20 shadow-[4px_4px_12px_rgba(0,0,0,0.2),-2px_-2px_8px_rgba(255,255,255,0.02),0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
              <SpinnerIcon className="w-8 h-8 text-[var(--accent-primary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {uploadingCount > 1 ? `Uploading ${uploadingCount} files...` : "Uploading..."}
            </p>
          </>
        ) : (
          <>
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)]",
                "shadow-[4px_4px_12px_rgba(0,0,0,0.2),-2px_-2px_8px_rgba(255,255,255,0.02)]",
                "group-hover:shadow-[5px_5px_14px_rgba(0,0,0,0.25),-3px_-3px_10px_rgba(255,255,255,0.03),0_0_20px_rgba(245,158,11,0.15)]",
                isDraggingOver
                  ? "bg-gradient-to-br from-[var(--accent-primary)]/25 to-[var(--accent-secondary)]/15 text-[var(--accent-primary)] scale-110 shadow-[5px_5px_14px_rgba(0,0,0,0.25),-3px_-3px_10px_rgba(255,255,255,0.03),0_0_25px_rgba(245,158,11,0.3)]"
                  : "text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]"
              )}
            >
              <UploadIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-[var(--text-primary)]">
                Drop files here or{" "}
                <span className="text-[var(--accent-primary)] font-semibold hover:text-[var(--accent-hover)] transition-colors underline decoration-[var(--accent-primary)]/30 underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Max 100 MB per file • Documents, code, and text files • Folders supported
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
