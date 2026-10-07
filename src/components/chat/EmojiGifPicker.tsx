"use client";

import React, { useState, useRef, useEffect } from "react";
import { Smile, Image as ImageIcon, Search, X } from "lucide-react";

interface EmojiGifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (gifUrl: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋",
      "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
      "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌",
      "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
      "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓",
    ],
  },
  {
    name: "Gestures",
    icon: "👍",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞",
      "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️",
      "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲",
      "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶",
    ],
  },
  {
    name: "Hearts & Vibes",
    icon: "❤️",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "💖", "💗", "💓", "💞", "💕", "💌", "💘", "💝",
      "✨", "⭐", "🌟", "💫", "💥", "🔥", "⚡", "🌈", "☀️", "🌙",
    ],
  },
  {
    name: "Fun & Objects",
    icon: "🎉",
    emojis: [
      "🎉", "🎊", "🎈", "🎂", "🎁", "🍾", "🥂", "🍻", "🥳", "👑",
      "🏆", "🎯", "🎮", "🚀", "🍕", "🍔", "🍟", "🍦", "🍩", "☕",
      "🍿", "🍫", "🍹", "🎧", "🎵", "🎸", "💻", "📱", "💸", "💎",
    ],
  },
];

const CURATED_GIFS = [
  {
    title: "Laughing Out Loud",
    category: "Haha",
    url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif",
    preview: "https://media.giphy.com/media/10JhviFuU2gWD6/200.gif",
  },
  {
    title: "Thumbs Up / Nice",
    category: "Thumbs Up",
    url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
    preview: "https://media.giphy.com/media/111ebonMs90YLu/200.gif",
  },
  {
    title: "Leonardo Cheers",
    category: "Cheers",
    url: "https://media.giphy.com/media/GCLlQnV7dXY2KGmpRh/giphy.gif",
    preview: "https://media.giphy.com/media/GCLlQnV7dXY2KGmpRh/200.gif",
  },
  {
    title: "Clapping Ovation",
    category: "Applause",
    url: "https://media.giphy.com/media/nbvFVPiEiJH6h44255/giphy.gif",
    preview: "https://media.giphy.com/media/nbvFVPiEiJH6h44255/200.gif",
  },
  {
    title: "Dancing Celebration",
    category: "Dance",
    url: "https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif",
    preview: "https://media.giphy.com/media/blSTtZehjAZ8I/200.gif",
  },
  {
    title: "Mind Blown",
    category: "Shock",
    url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    preview: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/200.gif",
  },
  {
    title: "Popcorn Watching",
    category: "Drama",
    url: "https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy.gif",
    preview: "https://media.giphy.com/media/gl0mkIZOW6Nwc/200.gif",
  },
  {
    title: "Cat Head Vibing",
    category: "Vibes",
    url: "https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif",
    preview: "https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/200.gif",
  },
  {
    title: "Love & Kisses",
    category: "Love",
    url: "https://media.giphy.com/media/26BRv0ThflsDTqUXa/giphy.gif",
    preview: "https://media.giphy.com/media/26BRv0ThflsDTqUXa/200.gif",
  },
  {
    title: "Yes Excited",
    category: "Yes",
    url: "https://media.giphy.com/media/nXxOjZrbnbRxS/giphy.gif",
    preview: "https://media.giphy.com/media/nXxOjZrbnbRxS/200.gif",
  },
  {
    title: "Facepalm",
    category: "Oops",
    url: "https://media.giphy.com/media/3oEjI67Egb8G9jNUGI/giphy.gif",
    preview: "https://media.giphy.com/media/3oEjI67Egb8G9jNUGI/200.gif",
  },
  {
    title: "Party Confetti",
    category: "Party",
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    preview: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif",
  },
];

export const EmojiGifPicker: React.FC<EmojiGifPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectGif,
}) => {
  const [activeTab, setActiveTab] = useState<"emojis" | "gifs">("emojis");
  const [selectedCategory, setSelectedCategory] = useState<string>("Smileys");
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCategoryObj =
    EMOJI_CATEGORIES.find((c) => c.name === selectedCategory) ||
    EMOJI_CATEGORIES[0];

  const filteredEmojis = search.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis)
    : currentCategoryObj.emojis;

  const filteredGifs = search.trim()
    ? CURATED_GIFS.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.category.toLowerCase().includes(search.toLowerCase())
      )
    : CURATED_GIFS;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-3 left-4 sm:left-6 z-40 w-[320px] sm:w-[360px] h-[380px] bg-card/95 backdrop-blur-xl border border-card-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Top Header & Tabs */}
      <div className="p-3 border-b border-card-border/70 flex items-center justify-between gap-2 bg-surface-200/50">
        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-2xl border border-card-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("emojis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "emojis"
                ? "bg-brand text-white shadow-glow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Emojis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gifs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "gifs"
                ? "bg-brand text-white shadow-glow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>GIFs</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-surface-100 rounded-full transition-colors"
          title="Close picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 pb-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "emojis" ? "Search emojis..." : "Search reaction GIFs..."
            }
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-100 border border-card-border/80 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Emoji Category Bar (if emojis tab and not searching) */}
      {activeTab === "emojis" && !search.trim() && (
        <div className="flex items-center gap-1 px-3 py-1 border-b border-card-border/40 overflow-x-auto scrollbar-none text-xs">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                selectedCategory === cat.name
                  ? "bg-brand/20 text-brand-light font-medium border border-brand/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "emojis" ? (
          <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => onSelectEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-100 rounded-xl transition-transform hover:scale-125 focus:outline-none select-none active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredGifs.map((gif, idx) => (
              <button
                key={`${gif.url}-${idx}`}
                type="button"
                onClick={() => onSelectGif(gif.url)}
                className="group relative rounded-xl overflow-hidden aspect-video bg-surface-100 border border-card-border/70 hover:border-brand transition-all hover:scale-[1.02] focus:outline-none shadow-md"
              >
                <img
                  src={gif.preview}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                  <span className="text-[10px] font-medium text-white truncate">
                    {gif.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="p-2 border-t border-card-border/50 text-[10px] text-center text-slate-400 bg-surface-200/30">
        {activeTab === "emojis"
          ? "Click an emoji to insert into message"
          : "Click a GIF to send immediately"}
      </div>
    </div>
  );
};
