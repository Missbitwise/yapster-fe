"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Message } from "@/types/message.types";

interface EditMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onSave: (messageId: string, content: string) => Promise<void> | void;
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
  isOpen,
  onClose,
  message,
  onSave,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setContent(message.content);
      setError(null);
    }
  }, [message]);

  if (!message) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Message content cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(message._id, content.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to edit message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Message" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Updated Content (Can be edited within 5 minutes)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-100 border border-card-border text-white text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            placeholder="Type new message content..."
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-surface-100 hover:bg-surface-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl shadow-glow-sm disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
