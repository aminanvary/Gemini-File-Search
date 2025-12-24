"use client";

import { useCallback, useState } from "react";
import { UploadIcon, SpinnerIcon } from "./Icons";
import { useUploadFile } from "@/lib/hooks";
import { toast } from "sonner";

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
      className={`
        relative border-2 border-dashed rounded-xl p-6 text-center
        transition-all duration-200 cursor-pointer
        ${
          isDraggingOver
            ? "border-[#6366f1] bg-[#6366f1]/10"
            : "border-[#2a2a4e] hover:border-[#6366f1]/50 hover:bg-[#1f1f35]"
        }
      `}
    >
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center gap-3">
        {uploadFile.isPending ? (
          <>
            <SpinnerIcon className="w-8 h-8 text-[#6366f1]" />
            <p className="text-sm text-gray-400">Uploading...</p>
          </>
        ) : (
          <>
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${isDraggingOver ? "bg-[#6366f1]/20 text-[#6366f1]" : "bg-[#2a2a4e] text-gray-400"}
                transition-colors
              `}
            >
              <UploadIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Drop files here or{" "}
                <span className="text-[#6366f1] hover:underline">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports text, PDF, images, audio, and video files
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



