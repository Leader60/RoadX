'use client';

import { useState, useEffect, useRef } from 'react';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  const [showSubscriptionCheck, setShowSubscriptionCheck] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. تحميل ملف الصوت فور فتح الصفحة
    const audio = new Audio('/intro.mp3');
    audioRef.current = audio;

    // دالة لتشغيل الصوت عند التفاعل
    const handlePlay = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch((err) => console.log("Audio play error:", err));
      }
    };

    // محاولة التشغيل التلقائي فوراً
    handlePlay();

    // في حال حظر المتصفح الصوت التلقائي، يتم تشغيله فور أول نقرة في الصفحة
    window.addEventListener('click', handlePlay, { once: true });
    window.addEventListener('touchstart', handlePlay, { once: true });

    // 2. مؤقت الـ 15 ثانية (15000 ميلي ثانية)
    const timer = setTimeout(() => {
      // إيقاف الصوت فوراً عند انتهاء الـ 15 ثانية
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // إظهار شاشة التحقق
      setShowSubscriptionCheck(true);
    }, 15000);

    // تنظيف الموارد عند مغادرة الصفحة
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
    <main style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 1. التطبيق الرئيسي يظل ظاهراً دائماً ولا يختفي */}
      <RoadXApp />

      {/* 2. شاشة التحقق من الاشتراك (تظهر بعد 15 ثانية فوق التطبيق) */}
      {showSubscriptionCheck && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>شاشة التحقق من الاشتراك</h2>
          <p>جاري التحقق من حالة اشتراكك، يرجى الانتظار...</p>
        </div>
      )}
    </main>
  );
}
