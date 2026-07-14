import { NextResponse } from "next/server";

// ثوابت البيئة
const PI_API_URL = "https://api.pi.network/v2"; // رابط API الرسمي

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fullName, email, paymentId, txid, amount } = data;

    // 1. التحقق من البيانات (Input Validation)
    if (!fullName || !email) {
      return NextResponse.json({ error: "البيانات الأساسية ناقصة" }, { status: 400 });
    }

    // 2. منطق التحقق من الدفع (Production Security Layer)
    if (paymentId || txid) {
      
      // هنا يجب إضافة دالة الاتصال الحقيقية بـ Pi API
      // مثال: await fetch(`${PI_API_URL}/payments/${paymentId}`, { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` } })
      
      const isPaymentValid = true; // ضع منطق التحقق الحقيقي هنا

      if (!isPaymentValid) {
        return NextResponse.json({ error: "معاملة غير صالحة أو لم يتم العثور عليها" }, { status: 403 });
      }

      // 3. حساب تواريخ الاشتراك بدقة (365 يوم)
      const now = new Date();
      const expirationDate = new Date(now);
      expirationDate.setDate(now.getDate() + 365); 

      const subscriptionData = {
        ...data,
        activationDate: now.toISOString(),
        expirationDate: expirationDate.toISOString(),
        paymentStatus: "completed",
        subscriptionStatus: "active"
      };

      // 4. الحفظ في قاعدة البيانات (أضف هنا كود الـ Database الخاص بك مثل Prisma/Supabase)
      // await db.subscriptions.create({ data: subscriptionData });

      return NextResponse.json({ 
        success: true, 
        message: "تم تفعيل اشتراكك السنوي في RoadX بنجاح! 🎉",
        expiresAt: expirationDate
      }, { status: 200 });

    } else {
      return NextResponse.json({ success: true, message: "تم تسجيل البيانات، يرجى إتمام الدفع" });
    }

  } catch (error: any) {
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
