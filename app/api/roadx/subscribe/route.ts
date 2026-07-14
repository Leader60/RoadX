import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fullName, email, piUid, piUsername, paymentId, txid } = data;

    if (!fullName || !email) {
      return NextResponse.json({ error: "البيانات الأساسية ناقصة" }, { status: 400 });
    }

    // ⚠️ هنا يجب حفظ الاشتراك فعلياً بقاعدة بياناتك (Supabase/Prisma/إلخ)
    // مثال:
    // await db.subscriptions.upsert({ where: { piUid }, create: { ...data, status: "active" }, update: { ...data, status: "active" } });

    console.log("✅ اشتراك جديد:", data);

    return NextResponse.json({ success: true, message: "تم تفعيل الاشتراك بنجاح" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "خطأ داخلي: " + error.message }, { status: 500 });
  }
}
