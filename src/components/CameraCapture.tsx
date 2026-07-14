"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Stage = "capture" | "preview" | "uploading";

export default function CameraCapture() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("capture");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setStage("preview");
    setError(null);
  }

  function handleRetake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setStage("capture");
    // Re-open the camera immediately for a fast retake.
    setTimeout(() => fileInputRef.current?.click(), 50);
  }

  async function handleLooksGood() {
    if (!file) return;
    setStage("uploading");
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You need to be signed in to share a glimpse.");
        setStage("preview");
        return;
      }

      const extension = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("glimpses")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("glimpses").getPublicUrl(path);

      const { error: insertError } = await supabase.from("glimpses").insert({
        user_id: user.id,
        image_url: publicUrl,
      });

      if (insertError) throw insertError;

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong uploading that. Give it another try.");
      setStage("preview");
    }
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-ink">
      {/* Hidden native camera input - opens the device camera on tap */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => router.push("/")}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-cream/70 transition hover:bg-white/10"
        >
          Cancel
        </button>
        <p className="text-sm font-medium text-cream/70">
          {stage === "preview" ? "Preview" : "New glimpse"}
        </p>
        <div className="w-14" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {stage === "capture" && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-5"
          >
            <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-cream/80 text-4xl">
              📷
            </span>
            <span className="text-base font-medium text-cream/80">
              Tap to open camera
            </span>
          </button>
        )}

        {(stage === "preview" || stage === "uploading") && previewUrl && (
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-cozy bg-black/20">
            <Image
              src={previewUrl}
              alt="Preview of your glimpse"
              fill
              className="object-cover"
              unoptimized
            />
            {stage === "uploading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-sm font-medium text-white">
                  Sharing your glimpse…
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mx-6 mb-2 rounded-xl bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      {stage === "preview" && (
        <div className="flex gap-3 px-6 pb-10">
          <button
            onClick={handleRetake}
            className="flex-1 rounded-full border border-cream/30 py-3.5 text-base font-medium text-cream/90 transition active:scale-[0.98]"
          >
            Retake
          </button>
          <button
            onClick={handleLooksGood}
            className="flex-1 rounded-full bg-sage py-3.5 text-base font-medium text-white shadow-card transition active:scale-[0.98]"
          >
            Looks Good
          </button>
        </div>
      )}

      {stage === "capture" && <div className="h-10" />}
    </div>
  );
}
