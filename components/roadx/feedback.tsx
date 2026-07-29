export function LoadingScreen() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // إذا لم يضغط المستخدم، تبدأ الموسيقى تلقائياً بعد 3 ثوانٍ
    const timer = setTimeout(() => {
      setStarted(true);
      try {
        const audio = new Audio("/songs_images/RoadX_Start.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setStarted(true);
    try {
      const audio = new Audio("/songs_images/RoadX_Start.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="text-3xl font-bold rx-gold-text tracking-widest">RoadX</div>

      {!started ? (
        <button
          onClick={handleStart}
          className="rx-press flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-6 py-3 text-gold hover:bg-gold hover:text-gold-foreground transition-colors animate-pulse"
        >
          <IconPlay size={22} />
          <span className="font-bold">تشغيل موسيقى البداية</span>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <IconSpinner size={28} className="text-gold" />
          <p className="text-sm text-muted-foreground">جارٍ تحميل الموسيقى...</p>
        </div>
      )}
    </div>
  );
}
