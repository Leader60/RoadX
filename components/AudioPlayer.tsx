'use client';

import { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  onEnded15Sec?: () => void;
}

export default function AudioPlayer({ onEnded15Sec }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // حفظ مرجع الدالة لمنع إعادات التشغيل الناتجة عن Re-render الأب
  const onEndedRef = useRef(onEnded15Sec);
  useEffect(() => {
    onEndedRef.current = onEnded15Sec;
  }, [onEnded15Sec]);

  useEffect(() => {
    // 1. استدعاء الصوت مرة واحدة فقط
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

    // 2. ضبط مؤقت الـ 15 ثانية
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    }, 15000);

    // 3. التنظيف فقط عند التفكيك النهائى للمكون
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []); // مصفوفة فارغة لضمان عدم إعادة التنفيذ نهائياً عند التنقل بين الصفحات

  return null;
}
