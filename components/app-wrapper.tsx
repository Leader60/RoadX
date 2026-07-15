function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasError, authMessage, isLoading } = usePiAuth();
  
  if (isLoading) return <AuthLoadingScreen />;
  
  if (hasError || !isAuthenticated) {
    return (
      <div style={{ padding: 20, textAlign: "center", direction: "rtl" }}>
        <p style={{ color: "red", fontWeight: "bold" }}>خطأ بالمصادقة:</p>
        <p>{authMessage}</p>
      </div>
    );
  }
  
  return <>{children}</>;
}
