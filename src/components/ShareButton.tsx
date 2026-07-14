import Link from "next/link";

export default function ShareButton() {
  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-t from-cream via-cream/95 to-transparent px-6 pb-6 pt-8">
      <Link
        href="/camera"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-sage py-4 text-base font-medium text-white shadow-card transition active:scale-[0.98]"
      >
        <span className="text-lg">📸</span>
        Share a Glimpse
      </Link>
    </div>
  );
}
