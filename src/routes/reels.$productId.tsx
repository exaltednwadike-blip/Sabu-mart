import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, X, Link as LinkIcon, Send } from "lucide-react";
import { getVideoProducts, getReelComments, postReelComment } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/reels/$productId")({
  component: ReelsViewer,
});

function ReelsViewer() {
  const navigate = useNavigate();
  const { productId } = useParams({ from: "/reels/$productId" });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      setUserId(user ? user.id : null);
    });
    getVideoProducts(50)
      .then(function (data) {
        setItems(data || []);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  function handleClose() {
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        <p className="text-sm text-white/70">Loading reels...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-sm text-white/70">No videos available right now.</p>
        <button onClick={handleClose} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
          Close
        </button>
      </div>
    );
  }

  const startIndex = Math.max(0, items.findIndex(function (it) { return it.id === productId; }));

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <button
        onClick={handleClose}
        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll" id="reels-scroll-container">
        {items.map(function (item, i) {
          return <ReelSlide key={item.id} item={item} userId={userId} isInitial={i === startIndex} />;
        })}
      </div>
    </div>
  );
}

function ReelSlide({ item, userId, isInitial }: { item: any; userId: string | null; isInitial: boolean }) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const slideRef = useRef<HTMLDivElement | null>(null);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(function () {
    if (userId) {
      isInWishlist(userId, item.id).then(setLiked).catch(function () {});
    }
  }, [userId, item.id]);

  useEffect(function () {
    if (isInitial && slideRef.current) {
      slideRef.current.scrollIntoView({ block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(function () {
    const video = videoRef.current;
    const slide = slideRef.current;
    if (!video || !slide) return;
    const observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(slide);
    return function () {
      observer.disconnect();
    };
  }, []);

  function handleLike() {
    if (!userId) {
      navigate({ to: "/login" });
      return;
    }
    toggleWishlist(userId, item.id).then(function (result) {
      setLiked(!!result);
    });
  }

  function openComments() {
    setCommentsOpen(true);
    getReelComments(item.id).then(setComments).catch(function () {});
  }

  function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      navigate({ to: "/login" });
      return;
    }
    const body = commentText.trim();
    if (!body) return;
    postReelComment(item.id, userId, body).then(function () {
      setCommentText("");
      getReelComments(item.id).then(setComments);
    });
  }

  function handleShare() {
    const url = window.location.origin + "/product/" + item.id;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(function () {});
    }
  }

  function handleCopyLink() {
    const url = window.location.origin + "/product/" + item.id;
    navigator.clipboard.writeText(url).then(function () {
      setLinkCopied(true);
      setTimeout(function () { setLinkCopied(false); }, 2000);
    });
  }

  return (
    <div ref={slideRef} className="relative flex h-full w-full snap-start items-center justify-center">
      <video
        ref={videoRef}
        src={item.videoUrl}
        loop
        muted
        playsInline
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-5 pb-8">
        <div className="min-w-0 flex-1 text-white">
          <p className="text-sm font-semibold">{item.storeName}</p>
          <p className="truncate text-sm">{item.title}</p>
          <p className="text-sm font-bold">₦{Number(item.price).toLocaleString()}</p>
          <button
            onClick={function () { navigate({ to: "/product/$productId", params: { productId: item.id } }); }}
            className="mt-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black"
          >
            View product
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 text-white">
            <Heart className={"h-7 w-7 " + (liked ? "fill-red-500 text-red-500" : "")} />
          </button>
          <button onClick={openComments} className="flex flex-col items-center gap-1 text-white">
            <MessageCircle className="h-7 w-7" />
          </button>
          <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white">
            <Share2 className="h-7 w-7" />
          </button>
          <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 text-white">
            <LinkIcon className="h-6 w-6" />
            {linkCopied ? <span className="text-[10px]">Copied!</span> : null}
          </button>
        </div>
      </div>

      {commentsOpen ? (
        <div className="absolute inset-x-0 bottom-0 z-30 max-h-[60%] rounded-t-2xl bg-white">
          <div className="flex items-center justify-between border-b border-border p-4">
            <p className="font-semibold">Comments</p>
            <button onClick={function () { setCommentsOpen(false); }}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
            ) : (
              comments.map(function (c: any) {
                return (
                  <div key={c.id} className="mb-3 text-sm">
                    <span className="font-semibold">{c.profiles ? c.profiles.full_name : "User"}</span>{" "}
                    <span className="text-muted-foreground">{c.body}</span>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handlePostComment} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={commentText}
              onChange={function (e) { setCommentText(e.target.value); }}
              placeholder="Add a comment..."
              className="flex-1 rounded-full border border-border px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
