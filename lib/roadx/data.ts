// RoadX — data model, catalog, and helpers.

export type TabId = "home" | "music" | "songs" | "playlists" | "about" | "contact";

export interface Track {
  id: string;
  title: string;
  artist: string;
  query: string; // placeholder image query
  summary: string;
  genre: string;
  releaseDate: string; // ISO date
  youtube?: string;
  spotify?: string;
  apple?: string;
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

// ---- Persistence keys ----
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
  { id: "music", label: "المقطوعة" },
  { id: "songs", label: "الأغاني" },
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

export const TRACKS: Track[] = [
  {
    id: "trk-aurora",
    title: "شفق الشمال",
    artist: "لينا فوس",
    query: "abstract aurora borealis album cover gold navy",
    summary:
      "افتتاحية سينمائية تمزج بين الأوركسترا الحديثة والإيقاعات الإلكترونية الدافئة، تأخذ المستمع في رحلة صاعدة نحو ذروة مبهرة.",
    genre: "إلكترونيك سينمائي",
    releaseDate: "2026-07-08",
    youtube: "https://youtube.com",
    spotify: "https://spotify.com",
    apple: "https://music.apple.com",
    baseLikes: 1284,
    baseComments: 96,
  },
  {
    id: "trk-midnight",
    title: "منتصف الليل الذهبي",
    artist: "أوريون سكاي",
    query: "golden midnight city skyline album cover luxury",
    summary:
      "أغنية بوب راقية بإيقاع هادئ وطبقات صوتية أنيقة، تعكس أجواء المدينة الليلية بلمسة فخمة.",
    genre: "بوب راقٍ",
    releaseDate: "2026-07-05",
    youtube: "https://youtube.com",
    spotify: "https://spotify.com",
    apple: "https://music.apple.com",
    baseLikes: 980,
    baseComments: 74,
  },
  {
    id: "trk-velvet",
    title: "مخمل",
    artist: "نوفا رين",
    query: "velvet red rose soul music album cover",
    summary:
      "مقطوعة سول ناعمة يتصدرها صوت دافئ وآلات حية، مثالية للأمسيات الهادئة.",
    genre: "سول / آر أند بي",
    releaseDate: "2026-07-02",
    youtube: "https://youtube.com",
    spotify: "https://spotify.com",
    apple: "https://music.apple.com",
    baseLikes: 745,
    baseComments: 52,
  },
  {
    id: "trk-horizon",
    title: "أفق مفتوح",
    artist: "ذا كوست",
    query: "open horizon ocean sunset indie album cover",
    summary:
      "إندي روك متفائل بجيتارات لامعة وإيقاع يبعث على الحركة، عن الحرية والطرق المفتوحة.",
    genre: "إندي روك",
    releaseDate: "2026-06-28",
    youtube: "https://youtube.com",
    spotify: "https://spotify.com",
    baseLikes: 612,
    baseComments: 40,
  },
  {
    id: "trk-echoes",
    title: "أصداء",
    artist: "كايرو ماس",
    query: "minimal echo sound waves dark blue album cover",
    summary:
      "أمبيانت تجريبي بطبقات متكررة تتلاشى ببطء، تجربة استماع تأملية عميقة.",
    genre: "أمبيانت",
    releaseDate: "2026-06-24",
    spotify: "https://spotify.com",
    apple: "https://music.apple.com",
    baseLikes: 431,
    baseComments: 28,
  },
  {
    id: "trk-lantern",
    title: "فانوس",
    artist: "سمر هيز",
    query: "warm lantern light folk acoustic album cover",
    summary:
      "فولك أكوستيك دافئ بكلمات شاعرية وصوت صادق، يشبه ليلة صيف هادئة.",
    genre: "فولك",
    releaseDate: "2026-06-20",
    youtube: "https://youtube.com",
    apple: "https://music.apple.com",
    baseLikes: 388,
    baseComments: 21,
  },
  {
    id: "trk-pulse",
    title: "نبض",
    artist: "فولت ناين",
    query: "neon pulse electronic dance album cover blue",
    summary:
      "هاوس راقص بإيقاع متصاعد وخط باص قوي، مصمّم لإشعال حلبة الرقص.",
    genre: "هاوس / رقص",
    releaseDate: "2026-06-16",
    youtube: "https://youtube.com",
    spotify: "https://spotify.com",
    apple: "https://music.apple.com",
    baseLikes: 854,
    baseComments: 63,
  },
  {
    id: "trk-marble",
    title: "رخام",
    artist: "إيلينا كورت",
    query: "elegant marble piano classical album cover gold",
    summary:
      "مقطوعة بيانو كلاسيكية معاصرة أنيقة، بسيطة ومؤثرة في آن واحد.",
    genre: "كلاسيكي معاصر",
    releaseDate: "2026-06-12",
    spotify: "https://spotify.com",
    apple: "https://music.apple.com",
    baseLikes: 507,
    baseComments: 34,
  },
];

export const TRACK_MAP: Record<string, Track> = TRACKS.reduce(
  (acc, t) => {
    acc[t.id] = t;
    return acc;
  },
  {} as Record<string, Track>,
);

export const TRACK_IDS = new Set(TRACKS.map((t) => t.id));

export const PLAYLISTS: Playlist[] = [
  {
    id: "pl-latenight",
    title: "أمسيات ذهبية",
    query: "golden late night lounge playlist cover navy",
    description: "منتقاة للسهرات الهادئة والأمسيات الراقية.",
    trackIds: ["trk-midnight", "trk-velvet", "trk-marble", "trk-lantern"],
    premium: false,
  },
  {
    id: "pl-focus",
    title: "تركيز عميق",
    query: "deep focus ambient minimal playlist cover blue",
    description: "أصوات أمبيانت وكلاسيكية تساعد على التركيز والصفاء.",
    trackIds: ["trk-echoes", "trk-marble", "trk-aurora"],
    premium: false,
  },
  {
    id: "pl-drive",
    title: "طريق مفتوح",
    query: "open road drive energetic playlist cover sunset",
    description: "إيقاعات نشطة لرحلات القيادة الطويلة.",
    trackIds: ["trk-horizon", "trk-pulse", "trk-midnight"],
    premium: false,
  },
  {
    id: "pl-editors",
    title: "اختيارات المحرّرين",
    query: "editors choice curated premium playlist cover gold",
    description: "أبرز الإصدارات التي اختارها فريق RoadX هذا الشهر.",
    trackIds: ["trk-aurora", "trk-pulse", "trk-velvet", "trk-horizon", "trk-marble"],
    premium: false,
  },
];

export function imageUrl(query: string, w = 600, h = 600): string {
  return `/placeholder.svg?height=${h}&width=${w}&query=${encodeURIComponent(query)}`;
}

// Featured = latest by release date; boxes = next three.
export function sortedByDate(): Track[] {
  return [...TRACKS].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
}
export function featuredTrack(): Track {
  return sortedByDate()[0];
}
export function featuredBoxes(): Track[] {
  return sortedByDate().slice(1, 4);
}

// ---- Helpers ----
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
  // strip control chars and angle brackets
  return v
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>]/g, "")
    .slice(0, max);
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

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
export function formatDate(iso: string | number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${toArabicNum(d.getDate())} ${AR_MONTHS[d.getMonth()]} ${toArabicNum(d.getFullYear())}`;
}

// ---- Sanitizers (treat stored blobs as untrusted) ----
export function sanitizeLikes(blob: unknown): string[] {
  if (!blob || typeof blob !== "object") return [];
  const raw = (blob as { ids?: unknown }).ids;
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const id = cleanStr(item, 64);
    if (TRACK_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
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
    out.push({
      id: cleanStr(o.id, 64) || uid("c"),
      trackId,
      text,
      createdAt: clampNum(o.createdAt, 0, 9e15, Date.now()),
    });
    if (out.length >= COMMENTS_CAP) break;
  }
  return out;
}
export function commentsToBlob(items: UserComment[]): Record<string, unknown> {
  return {
    items: items.slice(-COMMENTS_CAP).map((c) => ({
      id: c.id,
      trackId: c.trackId,
      text: c.text,
      createdAt: c.createdAt,
    })),
  };
}

export interface Prefs {
  lastTrackId: string;
}
export function sanitizePrefs(blob: unknown): Prefs {
  const fallback: Prefs = { lastTrackId: TRACKS[0].id };
  if (!blob || typeof blob !== "object") return fallback;
  const id = cleanStr((blob as { lastTrackId?: unknown }).lastTrackId, 64);
  return { lastTrackId: TRACK_IDS.has(id) ? id : TRACKS[0].id };
}
export function prefsToBlob(p: Prefs): Record<string, unknown> {
  return { lastTrackId: p.lastTrackId };
}
