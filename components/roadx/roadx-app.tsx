"use client";
import { AutoSubscriptionModal } from "./payment-button";
import { useEffect, useState } from "react";
import { RoadXProvider, useRoadX } from "@/contexts/roadx-context";
import type { TabId } from "@/lib/roadx/data";
import { AppHeader, BottomNav } from "./nav";
import { HomeView } from "./home-view";
import { MusicView } from "./music-view";
import { InstrumentalView } from "./instrumental-view";
import { SongsView } from "./songs-view";
import { PlaylistsView } from "./playlists-view";
import { AboutView } from "./about-view";
import { ContactView } from "./contact-view";
import { ToastHost, StorageNotice, LoadingScreen } from "./feedback";

// إضافة track_details كحالة تبويب ممكنة لتفاصيل الأغنية
type ExtendedTabId = TabId | "track_details";

function AppInner() {
  const { ready, prefs, setLastTrack, pushToast } = useRoadX();
  const [tab, setTab] = useState<ExtendedTabId>("home");
  const [trackId, setTrackId] = useState<string>(prefs.lastTrackId);

  useEffect(() => {
    if (ready) setTrackId(prefs.lastTrackId);
  }, [ready, prefs.lastTrackId]);

  const checkAccess = (targetTab: TabId): boolean => {
    if (!ready) return false;
    const userChoice = sessionStorage.getItem("roadx_user_choice");
    const restrictedTabs: TabId[] = ["music", "songs", "playlists"];
    if (userChoice === "premium_active") return true;
    if (restrictedTabs.includes(targetTab)) {
      pushToast("عذراً! هذه القائمة مخصصة للمشتركين فقط. يرجى الاشتراك للوصول إليها.", "error");
      return false;
    }
    return true;
  };

  const openTrack = (id: string) => {
    if (!checkAccess("music")) return;
    setTrackId(id);
    setLastTrack(id);
    setTab("track_details"); // عند النقر على الأغنية يفتح شاشة التفاصيل
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const navigate = (t: TabId) => {
    if (!checkAccess(t)) { setTab("home"); return; }
    setTab(t); // عند النقر على زر "مقطوعات موسيقية" (music) يفتح القائمة العامة
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (!ready) return <LoadingScreen />;

  // لإبقاء زر "مقطوعات موسيقية" نشطاً في الشاشات العلوية والسفلية حتى عند عرض تفاصيل الأغنية
  const activeTabForNav = (tab === "track_details" ? "music" : tab) as TabId;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background border-x-[5px] border-gold shadow-2xl">
      <AppHeader tab={activeTabForNav} onNavigate={navigate} />
      <main className="flex-1 pb-20">
        {tab === "home" && <HomeView onOpenTrack={openTrack} />}
        {tab === "track_details" && <MusicView trackId={trackId} onOpenTrack={openTrack} />}
        {tab === "music" && <InstrumentalView onOpenTrack={openTrack} />}
        {tab === "songs" && <SongsView onOpenTrack={openTrack} />}
        {tab === "playlists" && <PlaylistsView onOpenTrack={openTrack} />}
        {tab === "about" && <AboutView />}
        {tab === "contact" && <ContactView />}
      </main>
      <BottomNav tab={activeTabForNav} onNavigate={navigate} />
      <StorageNotice />
      <ToastHost />
      <AutoSubscriptionModal />
    </div>
  );
}

export function RoadXApp() {
  return (
    <RoadXProvider>
      <AppInner />
    </RoadXProvider>
  );
}
