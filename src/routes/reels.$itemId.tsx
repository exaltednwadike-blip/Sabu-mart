import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Share2, X, Send, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getReelComments, getReelItems, postReelComment } from "@/lib/products";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/reels/$itemId")({
  component: ReelsViewer,
});

function ReelsViewer() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerComments, setDrawerComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(function () {
    getCurrentUser().then(function (user) {
      setUserId(user ? user.id : null);
      if (user) {
        getReelItems(30).then(function (data) {
          setItems(data || []);
          setLoading(false);
        });
      } else {
        getReelItems(30).then(function (data) {
          setItems(data || []);
          setLoading(false);
        });
      }
    });
  }, []);

  useEffect(function () {
    if (!items.length) return;
    const startIndex = items.findIndex(function (item) { return item.id === params.itemId; });
    if (startIndex >= 0) setActiveIndex(startIndex);
  }, [items, params.itemId]);

  useEffect(function () {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const video = entry.target.querySelector("video");
          if (!video) return;
          if (entry.isIntersecting) {
            video.muted = true;
            video.play().catch(function () {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    Object.values(itemRefs.current).forEach(function (node) {
      if (node) observer.observe(node);
    });

    return function () {
      observer.disconnect();
    };
  }, [items]);

  useEffect(function () {
    if (!items.length || !userId) return;
    Promise.all(
      items.map(async function (item) {
        const result = await isInWishlist(userId, item.productId);
        return { id: item.id, liked: result };
      })
    ).then(function (results) {
      const map: Record<string, boolean> = {};
      results.forEach(function (result) {
        map[result.id] = result.liked;
      });
      setLiked(map);
    });
  }, [items, userId]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/80">Loading reels...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
        <p>No reels are available right now.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    );
  }

  function handleLike(item: any) {
    if (!userId) {
      navigate({ to: "/login" });
      return;
    }

    toggleWishlist(userId, item.productId)
      .then(function (nextValue) {
        setLiked(function (prev) {
          return { ...prev, [item.id]: nextValue };
        });
      })
      .catch(function () {});
  }

  function handleCommentOpen(item: any) {
    setDrawerOpen(true);
    getReelComments(item.productId)
      .then(function (comments) {
        setDrawerComments(comments || []);
      })
      .catch(function () {
        setDrawerComments([]);
      });
  }

  function handlePostComment(item: any) {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    if (!userId) {
      navigate({ to: "/login" });
      return;
    }

    setCommentBusy(true);
    postReelComment(item.productId, userId, trimmed)
      .then(function () {
        return getReelComments(item.productId);
      })
      .then(function (comments) {
        setDrawerComments(comments || []);
        setCommentInput("");
      })
      .catch(function () {})
      .finally(function () {
        setCommentBusy(false);
      });
  }

  function handleShare(item: any) {
    const shareUrl = window.location.origin + "/product/" + item.productId;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        url: shareUrl,
      }).catch(function () {});
    }
  }

  function handleCopyLink(item: any) {
    const shareUrl = window.location.origin + "/product/" + item.productId;
    navigator.clipboard.writeText(shareUrl)
      .then(function () {
        setShareCopied(true);
        window.setTimeout(function () { setShareCopied(false); }, 1500);
      })
      .catch(function () {});
  }

  function renderItem(item: any) {
    const isActive = item.id === items[activeIndex]?.id;

    return (
      <div
        key={item.id}
        ref={function (node) { itemRefs.current[item.id] = node; }}
        className="relative h-screen w-full snap-start overflow-hidden bg-black"
      >
        {item.type === "video" ? (
          <video
            src={item.url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            autoPlay={isActive}
            controls={false}
          />
        ) : (
          <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute inset-y-0 right-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 rounded-full bg-black/30 p-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={function () { handleLike(item); }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Like"
            >
              <Heart className="h-5 w-5" fill={liked[item.id] ? "#ef4444" : "none"} color={liked[item.id] ? "#ef4444" : "white"} />
            </button>
            <button
              type="button"
              onClick={function () { handleCommentOpen(item); }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Comments"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={function () { handleShare(item); }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={function () { handleCopyLink(item); }}
                className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white"
              >
                {shareCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 pb-8 text-white md:p-6">
          <div className="max-w-md rounded-2xl bg-black/25 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">{item.storeName}</p>
                <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
              </div>
              <span className="text-sm font-semibold text-white">₦{Number(item.price).toLocaleString()}</span>
            </div>
            <Link to="/product/$productId" params={{ productId: item.productId }} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
              View product <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <button
        type="button"
        onClick={function () { navigate({ to: "/" }); }}
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="h-screen snap-y snap-mandatory overflow-y-scroll bg-black" style={{ scrollSnapType: "y mandatory" }}>
        {items.map(renderItem)}
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-30 bg-black/60">
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-[2rem] border border-border bg-card p-4 text-foreground shadow-elegant">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Comments</h3>
              <button type="button" onClick={function () { setDrawerOpen(false); }} className="rounded-full bg-muted p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[45vh] space-y-3 overflow-y-auto">
              {drawerComments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
              ) : (
                drawerComments.map(function (comment: any) {
                  return (
                    <div key={comment.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="text-sm font-medium">{comment.profiles?.full_name || "SABU user"}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{comment.body}</div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={commentInput}
                onChange={function (e) { setCommentInput(e.target.value); }}
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={function () { handlePostComment(items[activeIndex]); }}
                disabled={commentBusy}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
