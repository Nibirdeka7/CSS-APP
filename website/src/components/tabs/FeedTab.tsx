"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Heart, MessageSquare, PlusCircle, RefreshCw, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function FeedTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data?.posts || []);
    } catch (e) {
      console.error("Feed error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const userId = user?._id || "";
            const isLiked = (post.likes || []).includes(userId);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id: string) => id !== userId)
                : [...(post.likes || []), userId],
            };
          }
          return post;
        })
      );
    } catch (e) {
      console.error("Like error:", e);
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
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">COMMUNITY</h1>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">
            Campus Sports Discussions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchPosts();
            }}
            className="w-10 h-10 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-cyan-400"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-cyan-400" : ""} />
          </button>

          <Link
            href="/create-post"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
          >
            <PlusCircle size={15} />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4 pt-1">
        {loading ? (
          <div className="p-12 text-center text-cyan-400 font-bold text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin" />
            <span>Loading community transmissions...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-[#0f172a] rounded-3xl border border-[#1e293b]">
            <p className="font-bold">No community posts yet.</p>
            <Link
              href="/create-post"
              className="mt-3 inline-block text-cyan-400 font-black uppercase text-xs hover:underline"
            >
              Be the first to share an update →
            </Link>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = (post.likes || []).includes(user?._id);

            return (
              <div
                key={post._id}
                className="bg-[#0f172a] border border-[#1e293b] rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Author Bar */}
                <div className="flex items-center p-4">
                  <div className="w-10 h-10 rounded-full border border-cyan-400 overflow-hidden bg-slate-900 flex-shrink-0">
                    <img
                      src={
                        post.user?.profilePicture ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                      }
                      alt={post.user?.name || "Author"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <span className="text-white font-bold text-sm block truncate">
                      @{post.user?.username || "student"}
                    </span>
                    <span className="text-slate-500 text-[10px] uppercase tracking-tight block">
                      {formatTime(post.createdAt)}
                    </span>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-[#1e293b] text-cyan-400 text-[10px] font-mono font-black italic">
                    ID: {post.user?.scholarId || "NITS"}
                  </div>
                </div>

                {/* Text Content */}
                {post.content && (
                  <p className="text-slate-200 px-5 pb-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Attached Image */}
                {post.image && (
                  <div className="w-full max-h-96 overflow-hidden bg-black">
                    <img
                      src={post.image}
                      alt="Post attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between p-4 bg-[#1e293b]/20 border-t border-[#1e293b]">
                  <div className="flex items-center gap-6">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-1.5 group transition-colors"
                    >
                      <Heart
                        size={20}
                        className={`transition-transform duration-200 group-hover:scale-110 ${
                          isLiked
                            ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : "text-slate-400 hover:text-white"
                        }`}
                      />
                      <span
                        className={`text-xs font-bold font-mono ${
                          isLiked ? "text-red-400" : "text-white"
                        }`}
                      >
                        {post.likes?.length || 0}
                      </span>
                    </button>

                    {/* Comment Link */}
                    <Link
                      href={`/post/${post._id}`}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                    >
                      <MessageSquare size={19} />
                      <span className="text-xs font-bold font-mono text-white">
                        {post.comments?.length || 0}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FeedTab;
