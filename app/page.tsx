'use client';

import { useState, useEffect, useRef } from 'react';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  const [showSubscriptionCheck, setShowSubscriptionCheck] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. تشغيل الموسيقى عند الفتح
    const audio = new Audio('/intro.mp3');
    audioRef.current = audio;

    const handlePlay = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((err) => console.log("Audio play error:", err));
      }
    };

    handlePlay();

    window.addEventListener('click', handlePlay, { once: true });
    window.addEventListener('touchstart', handlePlay, { once: true });

    // 2. إيقاف الصوت بعد 15 ثانية وتفعيل شاشة التحقق الأصلي
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setShowSubscriptionCheck(true);
    }, 15000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handlePlay);
      window.removeEventListener('touchstart', handlePlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <main>
      {/* نمرر حالة التحقق من الاشتراك لمكون التطبيق الأصلي لتظهر نافذته الحقيقية بشكل أنيق */}
      <RoadXApp showSubscriptionModal={showSubscriptionCheck} />
    </main>
  );
}
