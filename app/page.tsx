'use client';

import { useState } from 'react';
import { RoadXApp } from "@/components/roadx/roadx-app";
import AudioPlayer from "@/components/AudioPlayer";

export default function HomePage() {
  const [showSubscriptionCheck, setShowSubscriptionCheck] = useState(false);

  return (
    <main>
      {/* مشغل الصوت يعمل في الخلفية ويتولى حساب الـ 15 ثانية */}
      <AudioPlayer onEnded15Sec={() => setShowSubscriptionCheck(true)} />

      {!showSubscriptionCheck ? (
        // الواجهة الرئيسية خلال أول 15 ثانية
        <RoadXApp />
      ) : (
        // شاشة التحقق من الاشتراك تظهر بعد الـ 15 ثانية
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
        </div>
      )}
    </main>
  );
}
