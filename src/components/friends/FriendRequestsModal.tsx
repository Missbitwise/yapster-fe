"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FriendRequest } from "@/types/friend.types";
import { Avatar } from "@/components/ui/Avatar";
import { Check, X, Loader2, Send, Inbox, UserX } from "lucide-react";
import { formatJoinDate } from "@/utils/date";

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  sentRequests?: FriendRequest[];
  onRespond: (requestId: string, action: "accept" | "reject") => Promise<any>;
  onCancelRequest?: (requestId: string) => Promise<any>;
}

export const FriendRequestsModal: React.FC<FriendRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  sentRequests = [],
  onRespond,
  onCancelRequest,
}) => {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    try {
      setProcessingId(requestId);
      await onRespond(requestId, action);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!onCancelRequest) return;
    try {
      setCancelingId(requestId);
      await onCancelRequest(requestId);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Friend Requests"
      maxWidth="md"
    >
      {/* Tab Switcher: Received vs Sent */}
      <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-2xl border border-card-border mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "received"
              ? "bg-brand text-white shadow-glow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Received</span>
          {requests.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "received"
                  ? "bg-white/20 text-white"
                  : "bg-surface-50 text-slate-300"
              }`}
            >
              {requests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "sent"
              ? "bg-brand text-white shadow-glow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Sent</span>
          {sentRequests.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "sent"
                  ? "bg-white/20 text-white"
                  : "bg-surface-50 text-slate-300"
              }`}
            >
              {sentRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
        {activeTab === "received" ? (
          /* Received Requests Tab */
          requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-medium text-slate-300 mb-1">
                No pending received requests
              </p>
              <p className="text-[11px] text-slate-500">
                When someone sends you a friend request, it will show up here.
              </p>
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
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                        &quot;{req.bio}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleAction(req.id, "accept")}
                    disabled={processingId === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-glow-sm transition-all disabled:opacity-50"
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
          )
        ) : (
          /* Sent Requests Tab */
          sentRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Send className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-medium text-slate-300 mb-1">
                No pending sent requests
              </p>
              <p className="text-[11px] text-slate-500">
                Friend requests you send to other users will be listed here.
              </p>
            </div>
          ) : (
            sentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 border border-card-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={req.profile_picture}
                    name={req.name}
                    size="md"
                    ringColor="yellow"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {req.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      @{req.username}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Sent on {formatJoinDate(req.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleCancel(req.id)}
                    disabled={cancelingId === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                    title="Cancel this friend request"
                  >
                    {cancelingId === req.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserX className="w-3.5 h-3.5" />
                    )}
                    <span>Cancel Request</span>
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </Modal>
  );
};
