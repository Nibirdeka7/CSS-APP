"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import ScreenWrapper from "@/components/ScreenWrapper";
import { ArrowLeft, Send, RefreshCw, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.postId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (postId) loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const res = await api.get(`/comments/post/${postId}`);
      setComments(res.data?.comments || []);
    } catch (e) {
      console.error("Comments load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSending(true);
      const res = await api.post(`/comments/post/${postId}`, {
        content: newComment.trim(),
      });

      const added = {
        ...res.data?.comment,
        user: {
          username: user?.username,
          profilePicture: user?.profilePicture,
        },
      };

      setComments([added, ...comments]);
      setNewComment("");
    } catch (err: any) {
      alert("Comment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "recently";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  return (
    <ScreenWrapper hideNav={false}>
      <div className="space-y-4 animate-fade-in pb-16 flex flex-col min-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/?tab=feed")}
              className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">
              Discussion Thread
            </h1>
          </div>

          <button
            onClick={loadComments}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Comment Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add to the conversation..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-[#0f172a] border border-[#1e293b] focus:border-cyan-500 rounded-2xl px-4 py-3 text-white text-xs outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            className="w-11 h-11 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all flex-shrink-0 shadow-md shadow-cyan-500/20"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Comments Stream */}
        <div className="space-y-3 pt-2 flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-cyan-400 font-bold text-xs">
              Loading thoughts...
            </div>
          ) : comments.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
              <MessageSquare size={24} className="mx-auto text-slate-600 mb-2" />
              <span>No comments yet. Start the conversation!</span>
            </div>
          ) : (
            comments.map((c, idx) => (
              <div
                key={c._id || idx}
                className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-bold text-xs">
                    @{c.user?.username || "student"}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {formatTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}
