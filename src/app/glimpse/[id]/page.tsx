import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPostedAt } from "@/lib/utils";
import CountdownTimer from "@/components/CountdownTimer";
import CommentThread from "@/components/CommentThread";
import type { Comment, Glimpse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GlimpseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: glimpse, error } = await supabase
  .from("glimpses")
  .select("*")
  .eq("id", id)
  .single();



  if (!glimpse) notFound();
  const { data: profile } = await supabase
  .from("profiles")
  .select("display_name")
  .eq("id", glimpse.user_id)
  .single();

const posterName = profile?.display_name ?? "Someone";

  const { data: comments } = await supabase
    .from("comments")
    .select(
      "id, glimpse_id, user_id, content, created_at, profiles ( id, display_name, created_at )"
    )
    .eq("glimpse_id", id)
    .order("created_at", { ascending: true })
    .returns<Comment[]>();

  

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-cream/90 px-4 py-4 backdrop-blur">
        <Link
          href="/"
          className="rounded-full px-2 py-1.5 text-lg text-ink/60 transition hover:bg-ink/5"
          aria-label="Back to feed"
        >
          ←
        </Link>
        <div>
          <p className="text-sm font-medium text-ink">{posterName}</p>
          <p className="text-xs text-ink/40">
            {formatPostedAt(glimpse.created_at)} ·{" "}
            <CountdownTimer expiresAt={glimpse.expires_at} />
          </p>
        </div>
      </header>

      <div className="relative aspect-[4/5] w-full bg-ink/5">
        <img
  src={glimpse.image_url}
  alt={`Glimpse shared by ${posterName}`}
  className="h-full w-full object-contain"
/>
      </div>

     <CommentThread
  glimpseId={glimpse.id}
  initialComments={comments ?? []}
  currentUserId={user?.id ?? ""}
  isOwner={user?.id === glimpse.user_id}
/>
    </div>
  );
}
