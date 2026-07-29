'use client';

import { useEffect, useRef } from 'react';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. إنشاء عنصر الصوت
    const audio = new Audio('/intro.mp3');
    audioRef.current = audio;

    // دالة للتشغيل المضمون
    const handlePlay = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((err) => console.log("Audio play error:", err));
      }
    };

    // محاولة التشغيل التلقائي فور التحميل
    handlePlay();

    // تشغيل الصوت مع أول تفاعل للمستخدم في حال حظره المتصفح
    window.addEventListener('click', handlePlay, { once: true });
    window.addEventListener('touchstart', handlePlay, { once: true });

    // 2. إيقاف الموسيقى تماماً بعد 15 ثانية لتفسح المجال لشاشة التحقق
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 15000);

    // تنظيف الموارد عند الخروج
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
      {/* عرض التطبيق بشكل طبيعي مع ترك شاشة التحقق الداخلية تظهر تلقائياً */}
      <RoadXApp />
    </main>
  );
}
