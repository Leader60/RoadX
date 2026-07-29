'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RoadXApp } from "@/components/roadx/roadx-app";

export default function HomePage() {
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStart = () => {
    setHasStarted(true);
    
    // تشغيل الموسيقى فور ضغط الزر
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.log("Audio play error:", err));
    }
  };

  useEffect(() => {
    if (!hasStarted) return;

    const audio = audioRef.current;

    // إيقاف الموسيقى تلقائياً فور الوصول للثانية 15
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
        audio.pause();
      }
    };
  }, [hasStarted]);

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      {/* عنصر الصوت */}
      <audio ref={audioRef} src="/intro.mp3" preload="auto" />

      {!hasStarted ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#fafafa', // خلفية فاتحة متناسقة مع أوف وايت الموقع
          color: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          {/* عرض الشعار الأصلي */}
          <div style={{ marginBottom: '20px' }}>
            <Image 
              src="/roadx-logo.png" 
              alt="RoadX Logo" 
              width={180} 
              height={180} 
              priority 
              style={{ objectFit: 'contain' }}
            />
          </div>

          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>
            اضغط على الزر لبدء التجربة والموسيقى
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
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease'
            }}
          >
            دخول التطبيق 🎵
          </button>
        </div>
      ) : (
        /* عرض التطبيق بأسلوبه ومساحته الأصلية */
        <RoadXApp />
      )}
    </main>
  );
}
