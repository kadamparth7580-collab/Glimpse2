import LogoutButton from "@/components/LogoutButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-cream/90 px-6 pb-3 pt-6 backdrop-blur">
      <div>
        <h1 className="font-display text-2xl italic text-ink">Glimpse</h1>
        <p className="text-xs text-ink/50">
          A small place for ordinary moments.
        </p>
      </div>
      <LogoutButton />
    </header>
  );
}
