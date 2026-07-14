import Link from "next/link";
import type { Glimpse } from "@/lib/types";
import { formatPostedAt } from "@/lib/utils";
import CountdownTimer from "@/components/CountdownTimer";

export default function GlimpseCard({ glimpse }: { glimpse: Glimpse }) {
  const posterName = glimpse.profiles?.display_name ?? "Someone";

  return (
    <Link
      href={`/glimpse/${glimpse.id}`}
      className="block animate-fade-in overflow-hidden rounded-cozy bg-card shadow-card transition active:scale-[0.99]"
    >
      <div className="relative aspect-[4/5] w-full bg-ink/5">
        <img
          src={glimpse.image_url}
          alt={`Glimpse shared by ${posterName}`}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-sm font-medium text-white">
            {posterName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-medium text-ink">
              {posterName}
            </p>

            <p className="text-xs text-ink/40">
              {formatPostedAt(glimpse.created_at)}
            </p>
          </div>
        </div>

        <div className="text-xs font-medium">
          <CountdownTimer expiresAt={glimpse.expires_at} />
        </div>
      </div>
    </Link>
  );
}