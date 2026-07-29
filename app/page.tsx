'use client';

import { useState, useEffect, useRef } from 'react';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  // حالة التحكم بإظهار شاشة التحقق من الاشتراك
  const [showSubscriptionCheck, setShowSubscriptionCheck] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. إنشاء واستدعاء ملف الصوت من مجلد public
    const audio = new Audio('/songs_images/RoadX_Start.mp3');
    audioRef.current = audio;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("المتصفح حظر التشغيل التلقائي حتى يتفاعل المستخدم مع الصفحة:", err);
      }
    };

    playAudio();

    // 2. مؤقت لمدة 15 ثانية (15000 ميلي ثانية)
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      // إظهار شاشة التحقق من الاشتراك
      setShowSubscriptionCheck(true);
    }, 15000);

    // 3. التنظيف عند مغادرة الصفحة
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <main>
      {!showSubscriptionCheck ? (
        // التطبيق الرئيسي يعمل خلال أول 15 ثانية مع الموسيقى
        <RoadXApp />
      ) : (
        // شاشة التحقق من الاشتراك تظهر بعد 15 ثانية
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>شاشة التحقق من الاشتراك</h2>
          <p>جاري التحقق من حالة اشتراكك، يرجى الانتظار...</p>
          {/* يمكنك استبدال هذا الجزء بمكون التحقق الخاص بك (مثلاً <SubscriptionCheck />) */}
        </div>
      )}
    </main>
  );
}
