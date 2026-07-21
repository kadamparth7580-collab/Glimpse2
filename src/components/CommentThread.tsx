"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Comment, Profile } from "@/lib/types";
import CommentItem from "@/components/CommentItem";
import CommentInput from "@/components/CommentInput";

export default function CommentThread({
 glimpseId,
 initialComments,
 currentUserId,
 isOwner,
}: {
 glimpseId: string;
 initialComments: Comment[];
 currentUserId: string;
 isOwner: boolean;
}) {
 const supabase = createClient();
 const router = useRouter();
 const [comments, setComments] = useState<Comment[]>(initialComments);
 const [myProfile, setMyProfile] = useState<Profile | null>(null);
 const bottomRef = useRef<HTMLDivElement>(null);

 // Load the current user's profile once, used to label optimistic/realtime inserts.
 useEffect(() => {
   if (!currentUserId) return;
   supabase
     .from("profiles")
     .select("id, display_name, created_at")
     .eq("id", currentUserId)
     .single()
     .then(({ data }) => {
       if (data) setMyProfile(data as Profile);
     });
 }, [currentUserId, supabase]);

 // Subscribe to new comments on this glimpse in realtime.
 useEffect(() => {
   const channel = supabase
     .channel(`comments-${glimpseId}`)
     .on(
       "postgres_changes",
       {
         event: "INSERT",
         schema: "public",
         table: "comments",
         filter: `glimpse_id=eq.${glimpseId}`,
       },
       (payload) => {
         const newComment = payload.new as Comment;
         setComments((prev) => {
           if (prev.some((c) => c.id === newComment.id)) return prev;
           return [...prev, newComment];
         });
       }
     )
     .subscribe();

   return () => {
     supabase.removeChannel(channel);
   };
 }, [glimpseId, supabase]);

 useEffect(() => {
   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [comments.length]);

 async function handleDelete() {
   const confirmed = window.confirm(
     "Delete this glimpse? This can't be undone."
   );

   if (!confirmed) return;

   const { error } = await supabase
     .from("glimpses")
     .delete()
     .eq("id", glimpseId);

   if (error) {
     alert("Couldn't delete glimpse.");
     return;
   }

   router.push("/");
   router.refresh();
 }

 async function handleSubmit(content: string) {
   if (!currentUserId) return;

   // Create an optimistic comment so the sender sees it instantly.
   const optimisticId = `optimistic-${Date.now()}`;
   const optimisticComment: Comment = {
     id: optimisticId,
     glimpse_id: glimpseId,
     user_id: currentUserId,
     content,
     created_at: new Date().toISOString(),
     profiles: myProfile,
   };
   setComments((prev) => [...prev, optimisticComment]);

   // Insert into the database and request the joined profile so the returned
   // row matches the shape the thread expects when rendering.
   const { data, error } = await supabase
     .from("comments")
     .insert({
       glimpse_id: glimpseId,
       user_id: currentUserId,
       content,
     })
     .select(
       "id, glimpse_id, user_id, content, created_at, profiles ( id, display_name, created_at )"
     )
     .single();

   if (error) {
     console.error("❌ INSERT ERROR:", error);
     // Remove the optimistic comment on failure so the UI stays consistent.
     setComments((prev) => prev.filter((c) => c.id !== optimisticId));
     alert("Couldn't post comment. Please try again.");
     return;
   }

   if (data) {
     // Replace the optimistic comment with the definitive server row. If the
     // optimistic comment was already replaced by realtime, avoid duplication.
     const insertedRow = data as unknown as {
       id: string;
       glimpse_id: string;
       user_id: string;
       content: string;
       created_at: string;
       profiles: Profile | Profile[] | null;
     };

     const serverComment: Comment = {
       id: insertedRow.id,
       glimpse_id: insertedRow.glimpse_id,
       user_id: insertedRow.user_id,
       content: insertedRow.content,
       created_at: insertedRow.created_at,
       profiles: Array.isArray(insertedRow.profiles)
         ? insertedRow.profiles[0] ?? null
         : insertedRow.profiles ?? null,
     };

     setComments((prev) => {
       const alreadyHasServer = prev.some((c) => c.id === serverComment.id);
       const hasOptimistic = prev.some((c) => c.id === optimisticId);
       if (alreadyHasServer) {
         // Remove any lingering optimistic entry if present.
         return prev.filter((c) => c.id !== optimisticId);
       }
       if (hasOptimistic) {
         return prev.map((c) => (c.id === optimisticId ? serverComment : c));
       }
       // Fallback: append the returned comment.
       return [...prev, serverComment];
     });
   }
 }

 return (
   <div className="flex flex-1 flex-col">
     {isOwner && (
       <div className="px-4 pt-4">
         <button
           onClick={handleDelete}
           className="
             rounded-full
             bg-red-500
             px-4
             py-2
             text-sm
             font-medium
             text-white
             shadow-card
             transition-all
             duration-200
             hover:brightness-95
             active:scale-95
           "
         >
           🗑 Delete Glimpse
         </button>
       </div>
     )}
     <div className="flex flex-1 flex-col gap-3 px-4 py-4">
       <p className="mb-2 text-sm font-medium text-ink/50">
         {comments.length} {comments.length === 1 ? "comment" : "comments"}
       </p>
       {comments.length === 0 ? (
         <p className="py-6 text-center text-sm text-ink/40">
           No comments yet. Say something!
         </p>
       ) : (
         comments.map((comment) => (
           <CommentItem
             key={comment.id}
             comment={comment}
             isOwn={comment.user_id === currentUserId}
           />
         ))
       )}
       <div ref={bottomRef} />
     </div>

     <CommentInput onSubmit={handleSubmit} />
   </div>
 );
}
