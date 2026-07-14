"use client";

import { useState } from "react";

const QUICK_EMOJIS = ["❤️", "🥹", "😂", "😘", "🌻"];

const MORE_EMOJIS = [
  "😍",
  "🤍",
  "😭",
  "✨",
  "🫶",
  "🌸",
  "🦋",
  "🎀",
  "🌙",
  "⭐",
  "☀️",
  "🥰",
  "🙈",
  "🤭",
  "😳",
  "🥲",
  "💫",
  "🔥",
  "😌",
  "👀",
  "🙄",
  "😎",
  "😤",
  "🤔",
  "💀",
  "😅",
"🤗",
"🥳",
"😴",
"🤤",
"💖",
"💕",
"💞",
"💐",
"🌈",
];

export default function CommentInput({
  onSubmit,
}: {
  onSubmit: (content: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [showMore, setShowMore] = useState(false);

async function send(content: string) {
  const trimmed = content.trim();
  if (!trimmed || sending) return;

  setSending(true);
  await onSubmit(trimmed);
  setValue("");
  setShowMore(false);
  setSending(false);
}
  return (
    <div className="sticky bottom-0 border-t border-ink/5 bg-cream/95 px-4 pb-6 pt-3 backdrop-blur">
      {/* Quick Reactions */}
      <div className="mb-3 flex items-center gap-2 overflow-x-auto">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => send(emoji)}
            disabled={sending}
            className="
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-full bg-card text-2xl shadow-card
              transition-all duration-200
              hover:scale-110
              hover:shadow-lg
              active:scale-90
            "
          >
            {emoji}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="
            flex h-12 w-12 shrink-0 items-center justify-center
         rounded-full bg-card text-xl text-ink shadow-card
            transition-all duration-200
            hover:scale-110
            active:scale-90
          "
        >
          {showMore ? "−" : "+"}
        </button>
      </div>

      {/* Expanded Emoji Grid */}
      {showMore && (
        <div className="mb-3 animate-fade-in rounded-3xl bg-card p-3 shadow-card">
          <div className="grid grid-cols-5 gap-2">
            {MORE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => send(emoji)}
                disabled={sending}
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-2xl text-2xl
                  transition-all duration-200
                  hover:scale-110
                  hover:bg-ink/5
                  active:scale-90
                "
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="flex items-center gap-2"
      >
      <input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Say something…"
  maxLength={500}
  className="
    flex-1 rounded-full border border-ink/10
    bg-card px-4 py-3 text-sm shadow-soft
    transition-all duration-200
    focus:border-sage
    focus:shadow-lg
    focus:outline-none
  "
/>
        <button
          type="submit"
          disabled={sending || !value.trim()}
          className="
            rounded-full bg-sage px-5 py-3
            text-sm font-medium text-white shadow-card
            transition-all duration-200
            hover:brightness-95
            hover:shadow-lg
            active:scale-95
            active:brightness-75
            disabled:opacity-50
          "
        >
          Send
        </button>
      </form>
    </div>
  );
}