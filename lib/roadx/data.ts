// RoadX — data model, catalog, and helpers.

export type TabId = "home" | "music" | "songs" | "playlists" | "about" | "contact";

export interface Track {
  id: string;
  title: string;
  artist: string;
  query: string;
  image?: string;
  summary: string;
  genre: string;
  releaseDate: string;
  youtube?: string;
  spotify?: string;
  apple?: string;
  deezer?: string;
  baseLikes: number;
  baseComments: number;
}

export interface Playlist {
  id: string;
  title: string;
  query: string;
  description: string;
  trackIds: string[];
  premium: boolean;
}

export interface UserComment {
  id: string;
  trackId: string;
  text: string;
  createdAt: number;
}

export interface Toast {
  id: string;
  message: string;
  tone: "default" | "success" | "error";
}

export const KEYS = {
  likes: "roadx.likes",
  comments: "roadx.comments",
  prefs: "roadx.prefs",
} as const;

export const COMMENTS_CAP = 200;
export const LIKES_CAP = 300;
export const COMMENT_MAX = 400;

export const NAV_ITEMS: { id: TabId; label: string }[] = [
  { id: "home", label: "الرئيسية" },
  { id: "music", label: "مقطوعات موسيقية" },
  { id: "songs", label: "أغاني" },
  { id: "playlists", label: "قوائم حصرية" },
  { id: "about", label: "من نحن" },
  { id: "contact", label: "تواصل معنا" },
];

export const TICKER_ITEMS: string[] = [
  "إصدار جديد: أحدث المقطوعات العالمية تصل الآن إلى RoadX",
  "قائمة تشغيل حصرية جديدة لعشاق الجودة العالية",
  "تابع أهم الإصدارات الموسيقية أسبوعياً",
  "استمع عبر يوتيوب وسبوتيفاي وآبل ميوزك مباشرة",
  "منتقاة بعناية لجمهور مميّز يقدّر الموسيقى الراقية",
];

// ========================
// Google Sheets Data Source
// ========================
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQpPH_eKPqt_UoA4G7vlAa548KyhgRp71DV923qjPCI6Bj7EtWD3dCXp1LZ41uX9s-bheJpVda7_U3C/pub?gid=0&single=true&output=csv";

async function fetchTracksFromSheet(): Promise<Track[]> {
  try {
    const res = await fetch(SHEET_URL, { next: { revalidate: 60 } });
    const csv = await res.text();
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map((h) => h.trim());

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });

      return {
        id: obj.id,
        title: obj.title,
        artist: obj.artist,
        query: obj.query,
        image: obj.image || undefined,
        summary: obj.summary,
        genre: obj.genre,
        releaseDate: obj.releaseDate,
        youtube: obj.youtube || undefined,
        spotify: obj.spotify || undefined,
        apple: obj.apple || undefined,
        deezer: obj.deezer || undefined,
        baseLikes: parseInt(obj.baseLikes) || 0,
        baseComments: parseInt(obj.baseComments) || 0,
      };
    });
  } catch (error) {
    console.error("فشل جلب البيانات من Google Sheets:", error);
    return [];
  }
}

// البيانات المخزنة مؤقتاً
export let TRACKS: Track[] = [
  {
    id: "temp",
    title: "جاري التحميل...",
    artist: "RoadX",
    query: "music",
    summary: "يرجى الانتظار",
    genre: "موسيقى",
    releaseDate: "2026-01-01",
    baseLikes: 0,
    baseComments: 0,
  },
];

// تحديث البيانات كل دقيقة
async function refreshTracks() {
  const newTracks = await fetchTracksFromSheet();
  if (newTracks.length > 0) {
    TRACKS = newTracks;
    updateTrackReferences();
  }
}

function updateTrackReferences() {
  (TRACK_MAP as any) = TRACKS.reduce(
    (acc, t) => { acc[t.id] = t; return acc; },
    {} as Record<string, Track>,
  );
  (TRACK_IDS as any) = new Set(TRACKS.map((t) => t.id));
}

// التهيئة الأولية
updateTrackReferences();
refreshTracks();
setInterval(refreshTracks, 60000);

// ========================

export let TRACK_MAP: Record<string, Track> = {};
export let TRACK_IDS = new Set<string>();

export const PLAYLISTS: Playlist[] = [
  {
    id: "pl-latenight", title: "أمسيات ذهبية",
    query: "golden late night lounge playlist cover navy",
    description: "منتقاة للسهرات الهادئة والأمسيات الراقية.",
    trackIds: ["trk-midnight", "trk-velvet", "trk-marble", "trk-lantern"], premium: false,
  },
  {
    id: "pl-focus", title: "تركيز عميق",
    query: "deep focus ambient minimal playlist cover blue",
    description: "أصوات أمبيانت وكلاسيكية تساعد على التركيز والصفاء.",
    trackIds: ["trk-echoes", "trk-marble", "trk-aurora"], premium: false,
  },
  {
    id: "pl-drive", title: "طريق مفتوح",
    query: "open road drive energetic playlist cover sunset",
    description: "إيقاعات نشطة لرحلات القيادة الطويلة.",
    trackIds: ["trk-horizon", "trk-pulse", "trk-midnight"], premium: false,
  },
  {
    id: "pl-editors", title: "اختيارات المحرّرين",
    query: "editors choice curated premium playlist cover gold",
    description: "أبرز الإصدارات التي اختارها فريق RoadX هذا الشهر.",
    trackIds: ["trk-aurora", "trk-pulse", "trk-velvet", "trk-horizon", "trk-marble"], premium: false,
  },
];

export function imageUrl(query: string, w = 600, h = 600): string {
  return `/placeholder.svg?height=${h}&width=${w}&query=${encodeURIComponent(query)}`;
}

export function trackImage(track: Track, w = 600, h = 600): string {
  return track.image || imageUrl(track.query, w, h);
}

export function sortedByDate(): Track[] {
  return [...TRACKS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
}

export function featuredTrack(): Track { return sortedByDate()[0]; }
export function featuredBoxes(): Track[] { return sortedByDate().slice(1, 4); }

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clampNum(v: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function cleanStr(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001f\u007f]/g, "").replace(/[<>]/g, "").slice(0, max);
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
export function toArabicNum(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

export function formatCount(n: number): string {
  if (n >= 1000000) return toArabicNum(Math.round(n / 100000) / 10) + " م";
  if (n >= 1000) return toArabicNum(Math.round(n / 100) / 10) + " ألف";
  return toArabicNum(n);
}

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function formatDate(iso: string | number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${toArabicNum(d.getDate())} ${AR_MONTHS[d.getMonth()]} ${toArabicNum(d.getFullYear())}`;
}

export function sanitizeLikes(blob: unknown): string[] {
  if (!blob || typeof blob !== "object") return [];
  const raw = (blob as { ids?: unknown }).ids;
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const id = cleanStr(item, 64);
    if (TRACK_IDS.has(id) && !seen.has(id)) { seen.add(id); out.push(id); }
    if (out.length >= LIKES_CAP) break;
  }
  return out;
}

export function likesToBlob(ids: string[]): Record<string, unknown> {
  return { ids: ids.slice(0, LIKES_CAP) };
}

export function sanitizeComments(blob: unknown): UserComment[] {
  if (!blob || typeof blob !== "object") return [];
  const raw = (blob as { items?: unknown }).items;
  if (!Array.isArray(raw)) return [];
  const out: UserComment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const trackId = cleanStr(o.trackId, 64);
    const text = cleanStr(o.text, COMMENT_MAX);
    if (!TRACK_IDS.has(trackId) || !text) continue;
    out.push({ id: cleanStr(o.id, 64) || uid("c"), trackId, text, createdAt: clampNum(o.createdAt, 0, 9e15, Date.now()) });
    if (out.length >= COMMENTS_CAP) break;
  }
  return out;
}

export function commentsToBlob(items: UserComment[]): Record<string, unknown> {
  return { items: items.slice(-COMMENTS_CAP).map((c) => ({ id: c.id, trackId: c.trackId, text: c.text, createdAt: c.createdAt })) };
}

export interface Prefs { lastTrackId: string; }

export function sanitizePrefs(blob: unknown): Prefs {
  const fallback: Prefs = { lastTrackId: TRACKS[0]?.id || "" };
  if (!blob || typeof blob !== "object") return fallback;
  const id = cleanStr((blob as { lastTrackId?: unknown }).lastTrackId, 64);
  return { lastTrackId: TRACK_IDS.has(id) ? id : fallback.lastTrackId };
}

export function prefsToBlob(p: Prefs): Record<string, unknown> {
  return { lastTrackId: p.lastTrackId };
}
