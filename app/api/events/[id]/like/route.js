import { NextResponse } from "next/server";
import { toggleLike, getLikeInfo } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function POST(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนกดไลค์" }, { status: 401 });
  const result = await toggleLike(params.id, user.id);
  return NextResponse.json(result);
}

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  const result = await getLikeInfo(params.id, user?.id);
  return NextResponse.json(result);
}
