"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Smile } from "lucide-react";
import { EmojiGifPicker } from "./EmojiGifPicker";

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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
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
    setIsPickerOpen(false);
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

  const handleSelectEmoji = (emoji: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart ?? content.length;
      const end = inputRef.current.selectionEnd ?? content.length;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      handleTypingEvent();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newPos = start + emoji.length;
          inputRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  const handleSelectGif = (gifUrl: string) => {
    setIsPickerOpen(false);
    onSendMessage(gifUrl);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative p-3 sm:p-4 bg-surface-200/90 border-t border-card-border/60 backdrop-blur-md">
      {/* Emoji & GIF Popover Picker */}
      <EmojiGifPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectEmoji={handleSelectEmoji}
        onSelectGif={handleSelectGif}
      />

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2.5 bg-surface-100 border border-card-border/80 rounded-full px-3.5 py-1.5 shadow-inner transition-colors focus-within:border-brand/70"
      >
        {/* Emoji & GIF Toggle Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsPickerOpen((prev) => !prev)}
          title="Emojis & GIFs"
          className={`p-2 rounded-full transition-colors ${
            isPickerOpen
              ? "text-brand-light bg-brand/20 shadow-glow-sm"
              : "text-slate-400 hover:text-brand-light hover:bg-surface-50"
          } disabled:opacity-40`}
        >
          <Smile className="w-5 h-5" />
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
