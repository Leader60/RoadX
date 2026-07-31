'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  onEnded15Sec?: () => void;
}

export default function AudioPlayer({ onEnded15Sec }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef(onEnded15Sec);

  // تحديث المرجع بأسلوب آمن دون إحداث Re-render
  useEffect(() => {
    onEndedRef.current = onEnded15Sec;
  }, [onEnded15Sec]);

  useEffect(() => {
    const audio = new Audio('/intro.mp3');
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.warn("المتصفح منع التشغيل التلقائي:", err);
    });

    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    }, 15000);

    // تنظيف آمن: إيقاف الصوت وإزالة المؤقت فقط بدون التداخل مع state التنقل
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return null;
}
