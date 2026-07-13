import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fullName, email, phone, country, activationDate, expirationDate, piUsername, piUid } = data;

    // التحقق من وجود الحقول الأساسية
    if (!fullName || !email) {
      return NextResponse.json({ error: "البيانات الأساسية ناقصة" }, { status: 400 });
    }

    // طباعة البيانات في خادم الاستضافة للتأكد من وصولها
    console.log("تم استقبال بيانات مشترك جديد بنجاح:", {
      fullName,
      email,
      phone,
      country,
      piUsername,
      piUid,
      activationDate,
      expirationDate,
    });

    // إرجاع استجابة ناجحة للواجهة الأمامية
    return NextResponse.json({ 
      success: true, 
      message: "تم حفظ بيانات المشترك ومستعد لربط عمليات الدفع عبر الـ SDK." 
    }, { status: 200 });

  } catch (error) {
    console.error("حدث خطأ في التسجيل:", error);
    return NextResponse.json({ error: "فشل الخادم في حفظ البيانات" }, { status: 500 });
  }
}
