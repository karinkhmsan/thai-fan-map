import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db.mjs";
import { verifyPassword, signSession, sessionCookieOptions } from "@/lib/auth.mjs";

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ" }, { status: 400 });
  }
  const user = await getUserByUsername(username.trim());
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  const token = signSession(user.id);
  const res = NextResponse.json({ id: user.id, username: user.username, avatarColor: user.avatarColor });
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
}
