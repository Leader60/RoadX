import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ active: false });

  // ⚠️ استبدل هذا باستعلام حقيقي من قاعدة بياناتك حسب piUid
  // const sub = await db.subscriptions.findUnique({ where: { piUid: uid } });
  // return NextResponse.json({ active: sub?.status === "active", expirationDate: sub?.expirationDate });

  return NextResponse.json({ active: false });
}
