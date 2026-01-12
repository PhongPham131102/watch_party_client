"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/src/types/comment.types";
import { useAuthStore } from "@/src/store/auth.store";
import commentService from "@/src/services/comment.service";
import {
  MessageCircle,
  Send,
  Trash2,
  CornerDownRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CommentItemProps {
  comment: Comment;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReplyCountChange?: (delta: number) => void;
  isReply?: boolean;
  level?: number;
}

function CommentItem({
  comment,
  onReplySubmit,
  onDelete,
  onReplyCountChange,
  isReply = false,
  level = 0,
}: CommentItemProps) {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment._count?.replies || 0);

  const canDelete = user?.id === comment.userId;

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    try {
      const data = await commentService.getReplies(comment.id);
      setReplies(data);
      setShowReplies(true);
    } catch (error) {
      toast.error("Không thể tải phản hồi");
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplyClick = () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    setSubmitting(true);
    try {
      await onReplySubmit(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyForm(false);

      // Tăng reply count
      setReplyCount((prev) => prev + 1);

      // Tự động load và hiển thị replies sau khi trả lời
      // Đặc biệt quan trọng khi đây là lần đầu trả lời
      setLoadingReplies(true);
      try {
        const data = await commentService.getReplies(comment.id);
        setReplies(data);
        setShowReplies(true);
      } catch (error) {
        console.error("Failed to load replies:", error);
      } finally {
        setLoadingReplies(false);
      }
    } catch (error) {
      toast.error("Không thể gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(comment.id);

      // Nếu đang hiển thị replies, cập nhật local state để xóa comment con
      if (showReplies && replies.length > 0) {
        setReplies((prevReplies) =>
          prevReplies.filter((reply) => reply.id !== comment.id)
        );
      }
    } catch (error) {
      toast.error("Không thể xóa bình luận");
    } finally {
      setDeleting(false);
    }
  };

  // Handler để xóa reply con khỏi danh sách replies local
  const handleNestedDelete = async (commentId: string) => {
    await onDelete(commentId);

    // Cập nhật local replies state
    setReplies((prevReplies) =>
      prevReplies.filter((reply) => reply.id !== commentId)
    );

    // Giảm số lượng reply count
    setReplyCount((prev) => Math.max(0, prev - 1));

    // Thông báo cho component cha (nếu có)
    if (onReplyCountChange) {
      onReplyCountChange(-1);
    }
  };

  return (
    <div
      className={`${level > 0 ? "ml-8 md:ml-12" : ""} ${
        deleting ? "opacity-50 pointer-events-none" : ""
      }`}>
      <div className="flex gap-3 group">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar className="w-9 h-9 md:w-10 md:h-10 border border-white/10">
            <AvatarImage
              src={comment.user?.profile?.avatarUrl || undefined}
              alt={
                comment.user?.profile?.fullName ||
                comment.user?.username ||
                "User"
              }
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-600/20 text-white font-bold text-sm">
              {comment.user?.profile?.fullName?.charAt(0).toUpperCase() ||
                comment.user?.username?.charAt(0).toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Comment Content */}
          <div className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-white text-sm">
                  {comment.user?.profile?.fullName ||
                    comment.user?.username ||
                    "Người dùng"}
                </p>
                <span className="text-white/30">•</span>
                <p className="text-xs text-white/40">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>

              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 shrink-0 disabled:opacity-50"
                  title="Xóa bình luận">
                  {deleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>

            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            {level === 0 && (
              <button
                onClick={handleReplyClick}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors">
                <CornerDownRight size={14} />
                {showReplyForm ? "Hủy" : "Trả lời"}
              </button>
            )}

            {level === 0 && replyCount > 0 && (
              <button
                onClick={loadReplies}
                disabled={loadingReplies}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors disabled:opacity-50">
                <MessageCircle size={14} />
                {loadingReplies ? "Đang tải..." : `${replyCount} phản hồi`}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
              <div className="relative">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Viết phản hồi của bạn..."
                  disabled={submitting}
                  maxLength={1000}
                  rows={2}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none disabled:opacity-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {replyContent.length}/1000
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                    disabled={submitting}
                    className="px-3 py-1.5 text-xs text-white/60 hover:text-white transition-colors disabled:opacity-50">
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-medium transition-all text-xs">
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Gửi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReplySubmit={onReplySubmit}
                  onDelete={handleNestedDelete}
                  isReply={true}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MovieCommentsProps {
  movieId: string;
}

export default function MovieComments({ movieId }: MovieCommentsProps) {
  const { isAuthenticated, openAuthModal, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const limit = 10;
  const hasMore = page * limit < total;

  const loadComments = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await commentService.getMovieComments(
        movieId,
        pageNum,
        limit
      );

      if (pageNum === 1) {
        setComments(response.data);
      } else {
        setComments((prev) => [...prev, ...response.data]);
      }

      setTotal(response.meta.total);
      setPage(pageNum);
    } catch (error) {
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await commentService.createComment({
        movieId,
        content: content.trim(),
      });

      // Thêm comment mới vào đầu danh sách (optimistic update)
      const commentWithUser: Comment = {
        ...newComment,
        user: user!,
        _count: { replies: 0 },
        replies: [],
      };

      setComments((prev) => [commentWithUser, ...prev]);
      setTotal((prev) => prev + 1);
      setContent("");
      toast.success("Đã đăng bình luận");
    } catch (error) {
      toast.error("Không thể đăng bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string, replyContent: string) => {
    const newReply = await commentService.createComment({
      movieId,
      content: replyContent,
      parentCommentId: parentId,
    });

    // Cập nhật count của parent comment
    setComments((prevComments) => {
      const updateRepliesCount = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              _count: {
                ...comment._count,
                replies: (comment._count?.replies || 0) + 1,
              },
            };
          }
          return comment;
        });
      };
      return updateRepliesCount(prevComments);
    });

    setTotal((prev) => prev + 1);
    toast.success("Đã trả lời bình luận");
  };

  const handleDelete = async (commentId: string) => {
    await commentService.deleteComment(commentId);

    // Xóa bình luận khỏi state local
    setComments((prevComments) => {
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments.filter((comment) => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeComment(comment.replies);
          }
          return true;
        });
      };
      return removeComment(prevComments);
    });

    setTotal((prev) => Math.max(0, prev - 1));
    toast.success("Đã xóa bình luận");
  };

  // Load comments on mount
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageCircle className="text-primary" size={24} />
        <h2 className="text-2xl font-bold text-white">Bình luận ({total})</h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isAuthenticated
                ? "Viết bình luận của bạn..."
                : "Đăng nhập để bình luận"
            }
            disabled={!isAuthenticated || submitting}
            maxLength={1000}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/40">{content.length}/1000</span>

            <button
              type="submit"
              disabled={!isAuthenticated || submitting || !content.trim()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Gửi
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="text-center py-8 text-white/60 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReplySubmit={handleReplySubmit}
                onDelete={handleDelete}
              />
            ))}

            {hasMore && (
              <button
                onClick={() => loadComments(page + 1)}
                disabled={loading}
                className="w-full py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  "Xem thêm bình luận"
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
