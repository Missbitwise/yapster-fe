"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FriendRequest } from "@/types/friend.types";
import { Avatar } from "@/components/ui/Avatar";
import { Check, X, Loader2 } from "lucide-react";

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onRespond: (requestId: string, action: "accept" | "reject") => Promise<any>;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onRespond,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    try {
      setProcessingId(requestId);
      await onRespond(requestId, action);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Friend Requests (${requests.length})`}
      maxWidth="md"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {requests.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-xs">No pending friend requests</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 border border-card-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={req.profile_picture}
                  name={req.name}
                  size="md"
                  ringColor="purple"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {req.name}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    @{req.username}
                  </p>
                  {req.bio && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {req.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <button
                  onClick={() => handleAction(req.id, "accept")}
                  disabled={processingId === req.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow-sm transition-all disabled:opacity-50"
                  title="Accept request"
                >
                  {processingId === req.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Accept</span>
                </button>

                <button
                  onClick={() => handleAction(req.id, "reject")}
                  disabled={processingId === req.id}
                  className="p-1.5 rounded-xl bg-surface-50 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-card-border transition-colors disabled:opacity-50"
                  title="Decline request"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
