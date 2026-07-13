"use client";

import { AutoSubscriptionModal } from "./payment-button";
import { useEffect, useState } from "react";
import { RoadXProvider, useRoadX } from "@/contexts/roadx-context";
import type { TabId } from "@/lib/roadx/data";
import { AppHeader, BottomNav } from "./nav";
import { HomeView } from "./home-view";
import { MusicView } from "./music-view";
import { SongsView } from "./songs-view";
import { PlaylistsView } from "./playlists-view";
import { AboutView } from "./about-view";
import { ContactView } from "./contact-view";
import { ToastHost, StorageNotice, LoadingScreen } from "./feedback";

function AppInner() {
  const { ready, prefs, setLastTrack, toast } = useRoadX();
  const [tab, setTab] = useState<TabId>("home");
  const [trackId, setTrackId] = useState<string>(prefs.lastTrackId);

  // Adopt the persisted last track once state has loaded.
  useEffect(() => {
    if (ready) setTrackId(prefs.lastTrackId);
  }, [ready, prefs.lastTrackId]);

  // دالة فحص وتدقيق صلاحيات الوصول بناءً على حالة الاشتراك والدفع
  const checkAccess = (targetTab: TabId): boolean => {
    const userChoice = sessionStorage.getItem("roadx_user_choice");
    const restrictedTabs: TabId[] = ["music", "songs", "playlists"];

    // 1. إذا أتم المستخدم الدفع بنجاح، يُسمح له بالعبور والوصول لكامل ميزات الموقع
    if (userChoice === "premium_active") {
      return true;
    }

    // 2. إذا اختار التصفح المجاني المحدود ويحاول دخول الصفحات الموسيقية المحظورة
    if (userChoice === "free_guest" && restrictedTabs.includes(targetTab)) {
      if (toast) {
        toast("عذراً! هذه القائمة مخصصة للمشتركين فقط. يرجى الاشتراك للوصول إليها.");
      }
      return false; // يمنع الوصول
    }

    // 3. السماح بالوصول الافتراضي لباقي الحالات والصفحات العامة (مثل الرئيسية وحول واتصل بنا)
    return true;
  };

  const openTrack = (id: string) => {
    if (!checkAccess("music")) return;
    
    setTrackId(id);
    setLastTrack(id);
    setTab("music");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const navigate = (t: TabId) => {
    if (!checkAccess(t)) {
      // إجبار المستخدم على البقاء في الرئيسية في حال لم يملك صلاحية العبور للتبويب المطلوب
      setTab("home");
      return;
    }
    
    setTab(t);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  if (!ready) return <LoadingScreen />;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <AppHeader tab={tab} onNavigate={navigate} />
      <main className="flex-1 pb-20">
        {tab === "home" && <HomeView onOpenTrack={openTrack} />}
        {tab === "music" && <MusicView trackId={trackId} onOpenTrack={openTrack} />}
        {tab === "songs" && <SongsView onOpenTrack={openTrack} />}
        {tab === "playlists" && <PlaylistsView onOpenTrack={openTrack} />}
        {tab === "about" && <AboutView />}
        {tab === "contact" && <ContactView />}
      </main>
      <BottomNav tab={tab} onNavigate={navigate} />
      <StorageNotice />
      <ToastHost />
      {/* استدعاء نافذة الاشتراك التلقائية بمراحلها الثلاث */}
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
