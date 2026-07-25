import { NextResponse } from "next/server";

import { Redis } from "@upstash/redis";



const redis = new Redis({

  url: process.env.KV_REST_API_URL!,

  token: process.env.KV_REST_API_TOKEN!,

});



export async function POST(request: Request) {

  try {

    const data = await request.json();

    const { fullName, email, piUid } = data;



    if (!fullName || !email || !piUid) {

      return NextResponse.json({ error: "البيانات الأساسية ناقصة" }, { status: 400 });

    }



    await redis.set(`subscription:${piUid}`, {

      ...data,

      status: "active",

      savedAt: new Date().toISOString(),

    });



    return NextResponse.json({ success: true, message: "تم تفعيل الاشتراك بنجاح" }, { status: 200 });

  } catch (error: any) {

    return NextResponse.json({ error: "خطأ داخلي: " + error.message }, { status: 500 });

  }

} 

