'use client'; // ضروري جداً لأننا نستخدم خصاص متصفح و Hooks

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  onEnded15Sec?: () => void; // دالة يتم استدعاؤها بعد 15 ثانية لإظهار التحقق
}

export default function AudioPlayer({ onEnded15Sec }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. تشغيل الصوت
    const audio = new Audio('/intro.mp3'); // يقرأ مباشرة من مجلد public
    audioRef.current = audio;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("المتصفح حظر التشغيل التلقائي حتى يتفاعل المستخدم:", err);
      }
    };

    playAudio();

    // 2. إيقاف الصوت بعد 15 ثانية
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // استدعاء دالة التنبيه إن وجدت
      if (onEnded15Sec) {
        onEnded15Sec();
      }
    }, 15000);

    // 3. التنظيف عند إغلاق/تغيير الصفحة
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onEnded15Sec]);

  return null; // هذا المكون يعمل في الخلفية ولا يعرض أي شيء في الواجهة
}
