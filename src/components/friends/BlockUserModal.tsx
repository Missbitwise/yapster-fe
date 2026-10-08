"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ShieldAlert, Loader2 } from "lucide-react";

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string } | null;
  onConfirmBlock: (userId: string) => Promise<any> | any;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmBlock,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirmBlock(user.id);
      onClose();
    } catch (error) {
      console.error("Failed to block user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block User" maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4 pt-1">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-glow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <h4 className="text-base font-bold text-white mb-1.5">
            Are you sure you want to block {user.name}?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            They won&apos;t be able to send you messages or view your online status. You can unblock them at any time to resume your conversation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2 pt-2 border-t border-card-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold transition-colors border border-card-border disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-glow transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            <span>Block</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
