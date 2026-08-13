import { NextResponse } from "next/server";
import { toggleFollow, getFollowInfo } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function POST(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนติดตาม" }, { status: 401 });
  if (user.id === params.id) return NextResponse.json({ error: "ติดตามตัวเองไม่ได้" }, { status: 400 });
  const result = await toggleFollow(user.id, params.id);
  if (!result) return NextResponse.json({ error: "ทำรายการไม่ได้" }, { status: 400 });
  return NextResponse.json(result);
}

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  const result = await getFollowInfo(params.id, user?.id);
  return NextResponse.json(result);
}
