'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  onEnded15Sec?: () => void;
}

export default function AudioPlayer({ onEnded15Sec }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. استدعاء الملف الصوتي الجديد intro.mp3 من مجلد public
    const audio = new Audio('/intro.mp3');
    audioRef.current = audio;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("المتصفح حظر التشغيل التلقائي حتى يتفاعل المستخدم مع الصفحة:", err);
      }
    };

    playAudio();

    // 2. ضبط المؤقت الزمني المستقل (15 ثانية)
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (onEnded15Sec) {
        onEnded15Sec();
      }
    }, 15000);

    // 3. التنظيف عند إغلاق/تغيير الصفحة
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onEnded15Sec]);

  return null; // مكون يعمل في الخلفية فقط
}
