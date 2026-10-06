"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { BlockedUser } from "@/types/friend.types";
import { Avatar } from "@/components/ui/Avatar";
import { ShieldCheck, Loader2 } from "lucide-react";

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedUsers: BlockedUser[];
  onUnblock: (userId: string) => Promise<any>;
}

export const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({
  isOpen,
  onClose,
  blockedUsers,
  onUnblock,
}) => {
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const handleUnblock = async (userId: string) => {
    try {
      setUnblockingId(userId);
      await onUnblock(userId);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Blocked Contacts (${blockedUsers.length})`}
      maxWidth="md"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {blockedUsers.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-xs">No contacts are currently blocked</p>
          </div>
        ) : (
          blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 border border-card-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={user.profile_picture}
                  name={user.name}
                  size="md"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {user.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleUnblock(user.id)}
                disabled={unblockingId === user.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-card-border hover:border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
              >
                {unblockingId === user.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Unblock</span>
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
