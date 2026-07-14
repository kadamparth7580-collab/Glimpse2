import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl italic text-ink">Glimpse</h1>
        <p className="mt-3 text-sm text-ink/60">
          A small place for ordinary moments.
        </p>
      </div>
      <AuthForm />
    </main>
  );
}
