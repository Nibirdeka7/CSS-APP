"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import { X, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";

const MAX_CHARS = 200;

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !imageFile) {
      alert("Please provide text content or an image attachment.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (content.trim()) formData.append("content", content.trim());
      if (imageFile) formData.append("image", imageFile);

      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/?tab=feed");
    } catch (err: any) {
      console.error("Post error:", err);
      alert("Post failed: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <ScreenWrapper hideNav={true}>
      <div className="space-y-5 animate-fade-in pb-12 flex flex-col min-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.push("/?tab=feed")}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>

          <h1 className="text-lg font-black text-white tracking-tight uppercase">
            NEW POST
          </h1>

          <button
            onClick={handlePost}
            disabled={submitting || (!content.trim() && !imageFile) || isOverLimit}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin text-slate-950" />
            ) : (
              <span>POST</span>
            )}
          </button>
        </div>

        {/* Text Area */}
        <div className="flex-1 bg-[#0f172a] rounded-3xl border border-[#1e293b] p-5 flex flex-col shadow-xl">
          <textarea
            rows={5}
            placeholder="Share match hype, team announcements, sports updates..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 bg-transparent text-white text-base outline-none resize-none placeholder:text-slate-500 leading-relaxed"
          />

          {/* Image Preview if added */}
          {imagePreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden bg-black max-h-60 border border-[#1e293b]">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-[#1e293b]/70">
            {/* Image upload trigger */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#020617] border border-[#1e293b] text-cyan-400 text-xs font-bold uppercase cursor-pointer hover:border-cyan-500/50 transition-colors">
              <ImageIcon size={16} />
              <span>{imageFile ? "Change Photo" : "Add Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Character counter */}
            <span
              className={`font-mono text-xs font-bold ${
                isOverLimit ? "text-red-400" : "text-slate-500"
              }`}
            >
              {charCount} / {MAX_CHARS}
            </span>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
