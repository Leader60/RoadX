'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const returningFromStream = sessionStorage.getItem("roadx_returning_from_stream");
    if (returningFromStream === "1") {
      sessionStorage.removeItem("roadx_returning_from_stream");
      setHasStarted(true);
    }
  }, []);

  const handleStart = (e: React.MouseEvent) => {
    // إيقاف تسرب الحدث لضمان عدم تنشيط أي روابط أو نماذج بالخلفية (Feedback / Routing)
    e.stopPropagation();
    
    setHasStarted(true);
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log("Audio play error:", err));
    }
  };

  useEffect(() => {
    if (!hasStarted) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio && audio.currentTime >= 15) {
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };

    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [hasStarted]);

  return (
    <main style={{ position: 'relative', minHeight: '100vh' }}>
      {/* عنصر الصوت ثابت لا يُدمر ولا ينقطع عند بدء الدخول */}
      <audio ref={audioRef} src="/intro.mp3" preload="auto" />

      {/* الشاشة التمهيدية الفوقية */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#fafafa',
          color: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px',
          opacity: hasStarted ? 0 : 1,
          pointerEvents: hasStarted ? 'none' : 'auto',
          visibility: hasStarted ? 'hidden' : 'visible',
          transition: 'opacity 0.3s ease, visibility 0.3s ease'
        }}
      >
        {/* إطار خارجي 4px بلون ذهبي ملكي */}
        <div style={{
          padding: '4px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(179, 135, 40, 0.25)'
        }}>
          {/* الدائرة الكحلية الداخلية */}
          <div style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <Image 
              src="/roadx-logo.png" 
              alt="RoadX Logo" 
              width={120} 
              height={120} 
              priority 
              style={{ 
                objectFit: 'contain',
                filter: 'drop-shadow(0px 0px 10px rgba(255, 215, 0, 0.45)) drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.3))'
              }}
            />
          </div>
        </div>

        {/* النص الترحيبي */}
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          مرحباً بكم 👋
        </h2>
        
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px', textAlign: 'center' }}>
          للاستمتاع بتجربة موسيقية رائعة اضغط زر البدء
        </p>
        
        <button
          onClick={handleStart}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          دخول التطبيق 🎵
        </button>
      </div>

      {/* التطبيق الرئيسي مستقر ومحمل خلف الشاشة الشفافة */}
      <RoadXApp />
    </main>
  );
}
