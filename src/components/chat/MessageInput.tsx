"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
  disabledPlaceholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  disabledPlaceholder,
}) => {
  const [content, setContent] = useState("");
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTypingEvent = useCallback(() => {
    onTyping();

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      onStopTyping();
    }, 1500);
  }, [onTyping, onStopTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || disabled) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    onStopTyping();

    onSendMessage(content.trim());
    setContent("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-3 sm:p-4 bg-surface-200/90 border-t border-card-border/60 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2.5 bg-surface-100 border border-card-border/80 rounded-full px-3.5 py-1.5 shadow-inner transition-colors focus-within:border-brand/70"
      >
        {/* Attachment Mock Icon */}
        <button
          type="button"
          disabled={disabled}
          title="Attach file (mock)"
          className="p-2 text-slate-400 hover:text-brand-light rounded-full transition-colors disabled:opacity-40"
        >
          <Paperclip className="w-5 h-5 -rotate-45" />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={content}
          disabled={disabled}
          onChange={(e) => {
            setContent(e.target.value);
            handleTypingEvent();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? disabledPlaceholder || "Messaging disabled"
              : "Type your message..."
          }
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none py-1.5"
        />

        {/* Send Button matching reference purple paper airplane */}
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className={`p-2.5 rounded-full transition-all ${
            content.trim() && !disabled
              ? "bg-brand text-white shadow-glow hover:bg-brand-dark scale-105 active:scale-95"
              : "bg-surface-50 text-slate-500 opacity-60 cursor-not-allowed"
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4 translate-x-[1px]" />
        </button>
      </form>
    </div>
  );
};
