"use client";

import { useState } from "react";
import { PlusIcon, SpinnerIcon } from "./Icons";
import { useCreateStore } from "@/lib/hooks";
import { toast } from "sonner";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStoreModal({ isOpen, onClose }: CreateStoreModalProps) {
  const [name, setName] = useState("");
  const createStore = useCreateStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createStore.mutate(name.trim(), {
      onSuccess: () => {
        toast.success(`Created library "${name.trim()}"`);
        setName("");
        onClose();
      },
      onError: () => {
        toast.error("Failed to create library");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a2e] border border-[#2a2a4e] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Create New Library
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm text-gray-400 mb-2"
            >
              Library Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Research Papers"
              className="w-full px-4 py-3 bg-[#12121f] border border-[#2a2a4e] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#6366f1] transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#12121f] border border-[#2a2a4e] rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createStore.isPending}
              className="flex-1 px-4 py-3 bg-[#6366f1] hover:bg-[#818cf8] disabled:bg-[#6366f1]/50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {createStore.isPending ? (
                <SpinnerIcon className="w-5 h-5" />
              ) : (
                <PlusIcon className="w-5 h-5" />
              )}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateStoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#6366f1] hover:bg-[#818cf8] rounded-lg text-white font-medium transition-colors"
    >
      <PlusIcon className="w-5 h-5" />
      New Library
    </button>
  );
}



