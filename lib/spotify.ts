import type { Track, Artist, AlbumSimplified } from "./types";

/**
 * طبقة الاتصال بـ Spotify Web API باستخدام Client Credentials Flow.
 * هذا التدفق مناسب لعرض بيانات عامة (بدون تسجيل دخول مستخدم):
 * إصدارات جديدة، بيانات فنانين، بحث، وقوائم تشغيل عامة.
 *
 * المفاتيح تُقرأ من متغيرات البيئة فقط ولا تُستخدم أبدًا في كود الواجهة
 * (Client-side) — كل الطلبات تمر عبر هذا الملف الذي يعمل على السيرفر فقط.
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "SPOTIFY_CLIENT_ID أو SPOTIFY_CLIENT_SECRET غير موجودة في متغيرات البيئة. راجع ملف README لإعدادها."
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`فشل الحصول على رمز الدخول من Spotify: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

/**
 * طلب عام لأي endpoint في Spotify، مع تخزين مؤقت (Cache) عبر Next.js
 * لمدة ساعة افتراضيًا لتقليل عدد الطلبات وتفادي حدود الاستخدام المجانية.
 */
async function spotifyFetch<T>(
  path: string,
  revalidateSeconds = 3600
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Spotify API error (${res.status}) على المسار: ${path}`);
  }

  return res.json() as Promise<T>;
}

/** أحدث الإصدارات العالمية */
export async function getNewReleases(limit = 30, market = "US") {
  const data = await spotifyFetch<{
    albums: { items: AlbumSimplified[] };
  }>(`/browse/new-releases?limit=${limit}&country=${market}`);
  return data.albums.items;
}

/** بيانات فنان واحد */
export async function getArtist(id: string) {
  return spotifyFetch<Artist>(`/artists/${id}`);
}

/** أشهر أغاني فنان معيّن */
export async function getArtistTopTracks(id: string, market = "US") {
  const data = await spotifyFetch<{ tracks: Track[] }>(
    `/artists/${id}/top-tracks?market=${market}`
  );
  return data.tracks;
}

/** آخر إصدارات فنان معيّن */
export async function getArtistAlbums(id: string, limit = 12) {
  const data = await spotifyFetch<{ items: AlbumSimplified[] }>(
    `/artists/${id}/albums?include_groups=album,single&limit=${limit}&market=US`
  );
  return data.items;
}

/** تفاصيل إصدار/ألبوم واحد مع أغانيه */
export async function getAlbum(id: string) {
  return spotifyFetch<
    AlbumSimplified & { tracks: { items: Track[] } }
  >(`/albums/${id}`);
}

/** تفاصيل أغنية واحدة */
export async function getTrack(id: string) {
  return spotifyFetch<Track>(`/tracks/${id}`);
}

/** قائمة تشغيل (تُستخدم لعرض "الأكثر رواجًا" عبر قوائم Spotify التحريرية الرسمية) */
export async function getPlaylistTracks(playlistId: string, limit = 50) {
  const data = await spotifyFetch<{
    items: { track: Track }[];
  }>(`/playlists/${playlistId}/tracks?limit=${limit}`, 1800);
  return data.items.filter((i) => i.track).map((i) => i.track);
}

/** بحث موحّد عن أغاني وفنانين وألبومات */
export async function searchAll(query: string) {
  const data = await spotifyFetch<{
    tracks: { items: Track[] };
    artists: { items: Artist[] };
    albums: { items: AlbumSimplified[] };
  }>(
    `/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`,
    60
  );
  return data;
}

/** بحث عن أغاني ضمن نوع موسيقي معيّن (Genre) */
export async function searchByGenre(genre: string, limit = 30) {
  const data = await spotifyFetch<{ tracks: { items: Track[] } }>(
    `/search?q=${encodeURIComponent(
      `genre:"${genre}"`
    )}&type=track&limit=${limit}`
  );
  return data.tracks.items;
}
