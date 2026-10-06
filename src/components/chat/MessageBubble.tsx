"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/types/message.types";
import { Avatar } from "@/components/ui/Avatar";
import { Check, CheckCheck, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { formatMessageTime } from "@/utils/date";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  onEdit: (message: Message) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  senderName = "User",
  senderAvatar,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Check if message is within 5 minutes for editing
  const messageTime = new Date(message.createdAt).getTime();
  const isEditable = isMe && Date.now() - messageTime <= 5 * 60 * 1000;

  const formattedTime = formatMessageTime(message.createdAt);

  return (
    <div
      className={`group relative flex items-end gap-2.5 my-2.5 px-4 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Left Avatar for other user */}
      {!isMe && (
        <Avatar
          src={senderAvatar}
          name={senderName}
          size="sm"
          className="mb-1"
        />
      )}

      {/* Bubble container */}
      <div
        className={`relative max-w-[78%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-md transition-all ${
          isMe
            ? "bg-gradient-to-r from-brand to-brand-vibrant text-white rounded-br-sm shadow-glow-sm"
            : "bg-surface-100 text-slate-100 border border-card-border/60 rounded-bl-sm"
        }`}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Footer info: time, edited tag, status ticks */}
        <div
          className={`flex items-center gap-1.5 mt-1 text-[10px] select-none ${
            isMe ? "text-purple-200/90 justify-end" : "text-slate-400 justify-start"
          }`}
        >
          {message.editedAt && (
            <span className="italic opacity-80">(edited)</span>
          )}
          <span>{formattedTime}</span>

          {isMe && (
            <span className="inline-flex items-center ml-0.5" title={message.status}>
              {message.status === "sent" && (
                <Check className="w-3.5 h-3.5 text-purple-200" />
              )}
              {message.status === "delivered" && (
                <CheckCheck className="w-3.5 h-3.5 text-purple-200" />
              )}
              {message.status === "read" && (
                <CheckCheck className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]" />
              )}
            </span>
          )}
        </div>

        {/* Dropdown Action Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`absolute top-1.5 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-black/20 text-slate-200 transition-opacity ${
            isMe ? "left-[-28px]" : "right-[-28px]"
          }`}
          title="Message options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Context Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className={`absolute top-0 z-30 w-44 bg-card border border-card-border rounded-xl p-1 shadow-2xl animate-in fade-in duration-100 text-xs ${
              isMe ? "right-full mr-2" : "left-full ml-2"
            }`}
          >
            {isEditable && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(message);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-surface-100 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-brand-light" />
                <span>Edit message</span>
              </button>
            )}

            <button
              onClick={() => {
                setMenuOpen(false);
                onDeleteForMe(message._id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Delete for me</span>
            </button>

            {isMe && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteForEveryone(message._id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete for everyone</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
