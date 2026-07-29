'use client';

import { useEffect, useRef } from 'react';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // دالة محاولة تشغيل الصوت
    const playAudio = () => {
      audio.play().catch(() => {
        // إذا حظره المت المتصفح، سيعمل فور أول لمسة للشاشة
      });
    };

    // تشغيل الصوت فوراً عند التحميل
    playAudio();

    // ربط التشغيل بأي لمسة أو نقرة لفك حظر المتصفح فوراً في الثواني الأولى
    const handleUserInteraction = () => {
      if (audio.paused && audio.currentTime < 15) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    // مؤقت دقيق: عند وصول الصوت للثانية 15 يتم إيقافه نهائياً ومنع إعادة تشغيله
    const handleTimeUpdate = () => {
      if (audio.currentTime >= 15) {
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
    };
  }, []);

  return (
    <main>
      {/* عنصر الصوت ثابت في الـ DOM مباشرة لضمان عدم تأثره بأي تحديث داخل التطبيق */}
      <audio ref={audioRef} src="/intro.mp3" preload="auto" />

      {/* التطبيق الرئيسي */}
      <RoadXApp />
    </main>
  );
}
