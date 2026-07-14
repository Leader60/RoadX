import { NextResponse } from "next/server";
const PI_API_KEY = process.env.PI_API_KEY || "";

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    if (!paymentId) return NextResponse.json({ error: "paymentId مفقود" }, { status: 400 });

    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${PI_API_KEY}` },
    });
    if (!res.ok) {
      console.error("فشل approve:", await res.text());
      return NextResponse.json({ error: "فشل اعتماد الدفع" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
