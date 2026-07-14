import { NextResponse } from "next/server";

// هذا هو المفتاح الخاص من Pi Developer Portal
// يجب إضافته في Vercel كمتغير بيئي
const PI_API_KEY = process.env.PI_API_KEY || "";
const PI_PRIVATE_KEY = process.env.PI_PRIVATE_KEY || "";
const PI_APP_ID = process.env.PI_APP_ID || "roadx"; // اسم تطبيقك في Pi Network

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      fullName, 
      email, 
      phone, 
      country, 
      piUsername, 
      piUid,
      paymentId,    // معرف الدفع من Pi SDK
      amount,       // المبلغ
      memo,         // وصف الدفع
      txid          // معرف المعاملة من Pi Network
    } = data;

    // التحقق من وجود البيانات الأساسية
    if (!fullName || !email) {
      return NextResponse.json(
        { error: "البيانات الأساسية ناقصة" }, 
        { status: 400 }
      );
    }

    // ==========================================
    // الخطوة 1: إنشاء محفظة للمستخدم الجديد
    // ==========================================
    // في Pi Network، يتم إنشاء المحفظة تلقائياً عند أول عملية دفع
    // لكن يمكننا التحقق من وجود محفظة مسبقاً
    
    console.log("🔐 جاري إنشاء محفظة للمستخدم:", piUsername || fullName);
    
    // محاكاة إنشاء محفظة (في الإنتاج، ستستخدم Pi SDK)
    const walletAddress = `G${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const walletCreated = true;

    // ==========================================
    // الخطوة 2: معالجة الدفع
    // ==========================================
    if (paymentId && amount) {
      console.log("💰 جاري معالجة الدفع:", {
        paymentId,
        amount,
        memo,
        txid
      });

      // التحقق من صحة الدفع مع Pi Network
      // في الإنتاج، يجب استدعاء Pi SDK للتحقق من الدفع
      const paymentVerified = true; // محاكاة

      if (!paymentVerified) {
        return NextResponse.json(
          { error: "فشل التحقق من الدفع" }, 
          { status: 400 }
        );
      }

      // ==========================================
      // الخطوة 3: حفظ بيانات المشترك مع المحفظة
      // ==========================================
      const subscriptionData = {
        fullName,
        email,
        phone: phone || "غير محدد",
        country: country || "غير محدد",
        piUsername: piUsername || fullName,
        piUid: piUid || `user_${Date.now()}`,
        walletAddress: walletAddress,
        walletCreated: walletCreated,
        activationDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 يوم
        paymentId: paymentId,
        amount: amount,
        txid: txid || `tx_${Date.now()}`,
        paymentStatus: "completed",
        subscriptionStatus: "active",
        createdAt: new Date().toISOString()
      };

      // طباعة البيانات للتأكد
      console.log("✅ تم تسجيل مشترك جديد مع الدفع:", subscriptionData);

      // ==========================================
      // الخطوة 4: إرجاع استجابة كاملة
      // ==========================================
      return NextResponse.json({ 
        success: true,
        message: "تم إنشاء المحفظة وتأكيد الدفع بنجاح! 🎉",
        data: {
          walletAddress: walletAddress,
          subscriptionStatus: "active",
          activationDate: subscriptionData.activationDate,
          expirationDate: subscriptionData.expirationDate,
          payment: {
            id: paymentId,
            amount: amount,
            status: "completed"
          }
        }
      }, { status: 200 });

    } else {
      // ==========================================
      // حالة: تسجيل فقط بدون دفع (للمستخدمين الجدد)
      // ==========================================
      console.log("📝 تم تسجيل مستخدم جديد (بدون دفع):", {
        fullName,
        email,
        piUsername
      });

      return NextResponse.json({ 
        success: true,
        message: "تم حفظ بيانات المشترك بنجاح، يمكنه الآن الدفع للاشتراك.",
        data: {
          userId: `user_${Date.now()}`,
          fullName,
          email,
          registrationDate: new Date().toISOString()
        }
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error("❌ حدث خطأ في التسجيل:", error);
    return NextResponse.json(
      { 
        error: "فشل الخادم في حفظ البيانات: " + error.message 
      }, 
      { status: 500 }
    );
  }
}
