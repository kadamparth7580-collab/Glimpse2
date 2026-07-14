import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import GlimpseCard from "@/components/GlimpseCard";
import EmptyState from "@/components/EmptyState";
import ShareButton from "@/components/ShareButton";
import type { Glimpse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: glimpses, error } = await supabase
    .from("glimpses")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  console.log("ERROR:", error);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name");

  const glimpsesWithProfiles =
    glimpses?.map((glimpse) => ({
      ...glimpse,
      profiles:
        profiles?.find((profile) => profile.id === glimpse.user_id) ?? null,
    })) ?? [];

  const hasGlimpses = glimpsesWithProfiles.length > 0;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <Header />

      <main className="flex flex-1 flex-col">
        {hasGlimpses ? (
          <div className="flex flex-col gap-5 px-4 pb-4 pt-2">
            {glimpsesWithProfiles.map((glimpse) => (
              <GlimpseCard
                key={glimpse.id}
                glimpse={glimpse as Glimpse}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>

      <ShareButton />
    </div>
  );
}