import type { Comment } from "@/lib/types";

// A comment is treated as "emoji-only" if it contains no plain letters or
// digits, so we can render it a little larger and without a bubble.
function isEmojiOnly(content: string): boolean {
  return !/[a-zA-Z0-9]/.test(content.trim()) && content.trim().length > 0;
}

export default function CommentItem({
  comment,
  isOwn,
}: {
  comment: Comment;
  isOwn: boolean;
}) {
  console.log("COMMENT DATA:", comment);

const name = comment.profiles?.display_name ?? "Someone";
  const emojiOnly = isEmojiOnly(comment.content);

  return (
    <div
  className={`flex flex-col animate-fade-in transition-all duration-300 ${
    isOwn ? "items-end" : "items-start"
  }`}
>
      <span className="mb-1 px-1 text-[11px] font-medium text-ink/40">
        {name}
      </span>
      {emojiOnly ? (
     <p className="px-1 text-4xl leading-tight transition-all duration-200 hover:scale-110">
  {comment.content}
</p>
      ) : (
        <p
          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
           isOwn
  ? "bg-sage text-white shadow-card transition-all duration-200 hover:brightness-95"
  : "bg-card text-ink shadow-card transition-all duration-200 hover:shadow-lg"
          }`}
        >
          {comment.content}
        </p>
      )}
    </div>
  );
}
