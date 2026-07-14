import { NextResponse } from "next/server";
const PI_API_KEY = process.env.PI_API_KEY || "";

export async function POST(request: Request) {
  try {
    const { paymentId, txid } = await request.json();
    if (!paymentId || !txid) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: { Authorization: `Key ${PI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ txid }),
    });
    if (!res.ok) {
      console.error("فشل complete:", await res.text());
      return NextResponse.json({ error: "فشل إكمال الدفع" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
