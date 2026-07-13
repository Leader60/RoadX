"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import {
  KEYS,
  TRACK_MAP,
  type Track,
  type UserComment,
  type Toast,
  type Prefs,
  uid,
  sanitizeLikes,
  likesToBlob,
  sanitizeComments,
  commentsToBlob,
  sanitizePrefs,
  prefsToBlob,
  COMMENT_MAX,
  cleanStr,
  TRACKS,
} from "@/lib/roadx/data";

interface StateStore {
  get: (key: string) => Promise<{ blob: Record<string, unknown> } | null>;
  set: (key: string, blob: Record<string, unknown>) => Promise<void>;
}

// In-memory fallback when the Pi SDK is unavailable (e.g. App Studio preview iframe).
function createMemStore(): StateStore {
  const map = new Map<string, Record<string, unknown>>();
  return {
    async get(key) {
      return map.has(key) ? { blob: map.get(key)! } : null;
    },
    async set(key, blob) {
      map.set(key, blob);
    },
  };
}

// A debounced, backoff-aware saver for a single key.
function createSaver(
  store: StateStore,
  key: string,
  onNotice: (v: boolean) => void,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Record<string, unknown> | null = null;
  let backoff = 1800;

  const writeNow = async () => {
    if (pending === null) return;
    const blob = pending;
    pending = null;
    try {
      await store.set(key, blob);
      onNotice(false);
      backoff = 1800;
    } catch {
      // Keep the latest good state and retry with backoff — never lose data.
      pending = blob;
      onNotice(true);
      backoff = Math.min(backoff * 1.8, 30000);
      if (timer) clearTimeout(timer);
      timer = setTimeout(writeNow, backoff);
    }
  };

  return {
    schedule(blob: Record<string, unknown>) {
      pending = blob;
      if (timer) clearTimeout(timer);
      timer = setTimeout(writeNow, 1300);
    },
    async flush() {
      if (timer) clearTimeout(timer);
      await writeNow();
    },
  };
}

interface RoadXContextValue {
  ready: boolean;
  storageNotice: boolean;
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
  // likes
  likedIds: string[];
  isLiked: (trackId: string) => boolean;
  toggleLike: (trackId: string) => void;
  likeCount: (t: Track) => number;
  // comments
  comments: UserComment[];
  commentsFor: (trackId: string) => UserComment[];
  commentCount: (t: Track) => number;
  addComment: (trackId: string, text: string) => void;
  deleteComment: (id: string) => void;
  // prefs
  prefs: Prefs;
  setLastTrack: (trackId: string) => void;
}

const RoadXContext = createContext<RoadXContextValue | undefined>(undefined);

export function RoadXProvider({ children }: { children: ReactNode }) {
  const { sdk, isAuthenticated } = usePiAuth();

  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [prefs, setPrefs] = useState<Prefs>({ lastTrackId: TRACKS[0].id });

  const likedRef = useRef<string[]>([]);
  const commentsRef = useRef<UserComment[]>([]);
  const prefsRef = useRef<Prefs>({ lastTrackId: TRACKS[0].id });

  const storeRef = useRef<StateStore | null>(null);
  const saversRef = useRef<{
    likes: ReturnType<typeof createSaver>;
    comments: ReturnType<typeof createSaver>;
    prefs: ReturnType<typeof createSaver>;
  } | null>(null);

  const pushToast = (message: string, tone: Toast["tone"] = "default") => {
    const id = uid("t");
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  };
  const dismissToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Load state once authenticated or fallback to local memory immediately to bypass loading screen lock.
  useEffect(() => {
    let cancelled = false;

    const store: StateStore = (sdk && isAuthenticated)
      ? {
          get: (key) => sdk.state.get(key) as Promise<{ blob: Record<string, unknown> } | null>,
          set: (key, blob) => sdk.state.set(key, blob),
        }
      : createMemStore();
    storeRef.current = store;

    const notice = (v: boolean) => setStorageNotice(v);
    saversRef.current = {
      likes: createSaver(store, KEYS.likes, notice),
      comments: createSaver(store, KEYS.comments, notice),
      prefs: createSaver(store, KEYS.prefs, notice),
    };

    (async () => {
      try {
        const [likesRec, commentsRec, prefsRec] = await Promise.all([
          store.get(KEYS.likes),
          store.get(KEYS.comments),
          store.get(KEYS.prefs),
        ]);
        if (cancelled) return;
        const likes = sanitizeLikes(likesRec?.blob);
        const cmts = sanitizeComments(commentsRec?.blob);
        const pf = sanitizePrefs(prefsRec?.blob);
        likedRef.current = likes;
        commentsRef.current = cmts;
        prefsRef.current = pf;
        setLikedIds(likes);
        setComments(cmts);
        setPrefs(pf);
      } catch {
        // fresh start with defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sdk, isAuthenticated]);

  // Flush pending writes on tab hide/close.
  useEffect(() => {
    const flushAll = () => {
      const s = saversRef.current;
      if (!s) return;
      void s.likes.flush();
      void s.comments.flush();
      void s.prefs.flush();
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flushAll();
    };
    window.addEventListener("pagehide", flushAll);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flushAll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // ---- likes ----
  const isLiked = (trackId: string) => likedRef.current.includes(trackId);
  const toggleLike = (trackId: string) => {
    const has = likedRef.current.includes(trackId);
    const next = has
      ? likedRef.current.filter((id) => id !== trackId)
      : [...likedRef.current, trackId];
    likedRef.current = next;
    setLikedIds(next);
    saversRef.current?.likes.schedule(likesToBlob(next));
  };
  const likeCount = (t: Track) => t.baseLikes + (likedRef.current.includes(t.id) ? 1 : 0);

  // ---- comments ----
  const commentsFor = (trackId: string) =>
    commentsRef.current
      .filter((c) => c.trackId === trackId)
      .sort((a, b) => b.createdAt - a.createdAt);
  const commentCount = (t: Track) =>
    t.baseComments + commentsRef.current.filter((c) => c.trackId === t.id).length;

  const addComment = (trackId: string, textRaw: string) => {
    const text = cleanStr(textRaw, COMMENT_MAX).trim();
    if (!text) return;
    if (!TRACK_MAP[trackId]) return;
    const entry: UserComment = { id: uid("c"), trackId, text, createdAt: Date.now() };
    const next = [...commentsRef.current, entry];
    commentsRef.current = next;
    setComments(next);
    saversRef.current?.comments.schedule(commentsToBlob(next));
    pushToast("تمت إضافة تعليقك", "success");
  };
  const deleteComment = (id: string) => {
    const next = commentsRef.current.filter((c) => c.id !== id);
    commentsRef.current = next;
    setComments(next);
    saversRef.current?.comments.schedule(commentsToBlob(next));
  };

  // ---- prefs ----
  const setLastTrack = (trackId: string) => {
    if (!TRACK_MAP[trackId]) return;
    const next: Prefs = { lastTrackId: trackId };
    prefsRef.current = next;
    setPrefs(next);
    saversRef.current?.prefs.schedule(prefsToBlob(next));
  };

  const value = useMemo<RoadXContextValue>(
    () => ({
      ready,
      storageNotice,
      toasts,
      pushToast,
      dismissToast,
      likedIds,
      isLiked,
      toggleLike,
      likeCount,
      comments,
      commentsFor,
      commentCount,
      addComment,
      deleteComment,
      prefs,
      setLastTrack,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, storageNotice, toasts, likedIds, comments, prefs],
  );

  return <RoadXContext.Provider value={value}>{children}</RoadXContext.Provider>;
}

export function useRoadX() {
  const ctx = useContext(RoadXContext);
  if (!ctx) throw new Error("useRoadX must be used within RoadXProvider");
  return ctx;
}
