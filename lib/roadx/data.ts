// RoadX — data model, catalog, and helpers.

export type TabId = "home" | "music" | "songs" | "playlists" | "about" | "contact";

export interface Track {
  id: string;
  title: string;
  artist: string;
  query: string; // placeholder image query
  image?: string; // صورة مخصصة (اختياري) — تُستخدم بدل التوليد التلقائي إن وُجدت
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
    id: "El Ghader Men Tabaak-Dana",
    title: "الغدر من طبعك",
    artist: "دانة",
    query: "El Ghader Men Tabaak - الغدر من طبعك",
    image: "/songs_images/El Ghader Men Tabaak.png",
    summary:
      "أغنية شجن وطرب خليجي حزين تحمل أسمى معاني الألم بسبب الغدر والخيانة",
    genre: "خليجي حزين",
    releaseDate: "2026-07-08",
    youtube: "https://youtu.be/lSH1lqquPAg?si=MUt-K2VXT4uJaf1W",
    spotify: "https://open.spotify.com/track/6WVt1iisyMfEGXiVfqEDfd?si=749e290f8e634910",
    apple: "https://music.apple.com",
    baseLikes: 1284,
    baseComments: 96,
  },
  {
    id: "Haza Qadary-Dana",
    title: "هذا قدري",
    artist: "دانة",
    query: "Haza Qadary - هذا قدري",
     image: "/songs_images/Haza Qadary.png",
    summary:
      "أغنية عاطفية مليئة بالحب والشوق والشجن باللهجة الخليجية الجميلة",
    genre: "خليجي رائع",
    releaseDate: "2026-07-05",
    youtube: "https://youtu.be/0BgY_DutR9A?si=sevD085V8pPzafYt",
    spotify: "https://open.spotify.com/track/6pyGx2Js2ODBGqecP7etzH?si=78922a491e33443f",
    apple: "https://music.apple.com",
    baseLikes: 980,
    baseComments: 74,
  },
  {
    id: "Asirni - Sophia",
    title: "آسرني",
    artist: "صوفيا كازياليس",
    query: "asirni",
    image: "/songs_images/asirni.png",
    summary:
      "أغنية عاطفية حزينة، حب وخذلان، شوق وفراق باللهجة الخليجية البيضاء",
    genre: "طرب خليجي - السامري البطيء",
    releaseDate: "2026-07-02",
    youtube: "https://youtu.be/cDz9ctgbczI?si=K5McGmifl_9y2hmo",
    spotify: "https://open.spotify.com/track/4C86glWvHIhpRo5c4ze5oD?si=530fb34b8c7a4e38",
    apple: "https://music.apple.com",
    baseLikes: 745,
    baseComments: 52,
  },
  {
    id: "Ο Δρόμος Έκλεισε",
    title: "الطريق مغلق",
    artist: "Σοφία Κασαγιάλις - صوفيا كازياليس",
    query: "Ο Δρόμος Έκλεισε - الطريق مغلق",
    image: "/songs_images/Ο Δρόμος Έκλεισε.png",
    summary:
      "أغنية يونانية عاطفية مؤثرة وموسيقا لايكا رائعة",
    genre: "لايكا / بوب يوناني حديث",
    releaseDate: "2026-06-28",
    youtube: "https://youtu.be/gQckuxWbuAU?si=skUBtniU-hZT7PjY",
    spotify: "https://open.spotify.com/track/5mVzA1GaSTQaFZTSQAr9Up?si=f7bf1f4f83954b3c",
    apple: "https://music.apple.com",
    baseLikes: 612,
    baseComments: 40,
  },
  {
    id: "min qasiun - Haitham",
    title: "من قاسيون سلامٌ",
    artist: "هيثم الموراني",
    query: "min qasiun salam - من قاسيون سلام يا وطني",
    image: "/songs_images/min qasiun.png",
    summary:
      "أغنية وطنية لسوريا الإباء، وقاسيون الشامخ يحرس دمشق مدينة الحضارة والتاريخ",
    genre: "نشيد وطني",
    releaseDate: "2026-06-24",
    youtube: "https://youtu.be/WJdF6zTuj_A?si=v8YBnzY5rf1PpsCg",
    spotify: "https://open.spotify.com/track/7e8rs5QHysP9d5MqxhNsFD?si=79aedc48ec154649",
    apple: "https://music.apple.com",
    baseLikes: 431,
    baseComments: 28,
  },
  {
    id: "JE NE SERAI PLUS DUPE - لن أخدع بعد الآن",
    title: "لن أخدع بعد الآن",
    artist: "ميراي كابتيفانت",
    query: "Mirai captivant - ميراي كابتيفانت",
    image: "/songs_images/JE NE SERAI PLUS DUPE.png",
    summary:
      "أغنية فرنسية عاطفية مع لحن ملائكي مليء بالشجن والعتب والألم",
    genre: "فولك",
    releaseDate: "2026-06-20",
    youtube: "https://youtu.be/0-_DwKfTNtQ?si=lebOpA5Qn3BiG_ZR",
    spotify: "https://open.spotify.com/track/6OgD65BKKVg6ei3m1TetdK?si=5132dbd0a90745f7",
    apple: "https://music.apple.com",
    baseLikes: 388,
    baseComments: 21,
  },
  {
    id: "Lágrimas de Fuego - دموع النار",
    title: "دموع النار",
    artist: "فولت ناين",
    query: "Lágrimas de Fuego - دموع النار",
     image: "/songs_images/Lágrimas de Fuego.png",
    summary:
      "أغنية فلامنكو إسباني بلحن عذب، وصوت يحلق إلى قبة السماء",
    genre: "فلامنكو",
    releaseDate: "2026-06-16",
    youtube: "https://youtu.be/2Lrd_XQsvGc?si=lLTeqge1TNoQTnKz",
    spotify: "https://open.spotify.com/album/1LEjN7JLNvgRGLb3nnIYn4?si=KDbCmS9xSRKSqMlh5oeUyw",
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
    youtube: "https://youtu.com",
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

// يُستخدم في كل مكان تُعرض فيه صورة أغنية — يفضّل حقل image المخصص إن وُجد، وإلا يولّد صورة تلقائية من query
export function trackImage(track: Track, w = 600, h = 600): string {
  return track.image || imageUrl(track.query, w, h);
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
