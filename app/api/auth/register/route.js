import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getUserByUsername, createUser } from "@/lib/db.mjs";
import { hashPassword, signSession, sessionCookieOptions } from "@/lib/auth.mjs";

const AVATAR_COLORS = ["#5271FF", "#49CAFF", "#181D52", "#35398C", "#5DCAA5", "#F0997B"];

export async function POST(req) {
  const { username, password } = await req.json();

  if (!username || username.trim().length < 2) {
    return NextResponse.json({ error: "ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }
  const existing = await getUserByUsername(username.trim());
  if (existing) {
    return NextResponse.json({ error: "มีชื่อผู้ใช้นี้อยู่แล้ว" }, { status: 409 });
  }

  const user = {
    id: uuid(),
    username: username.trim(),
    passwordHash: await hashPassword(password),
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: new Date().toISOString(),
  };
  await createUser(user);

  const token = signSession(user.id);
  const res = NextResponse.json({ id: user.id, username: user.username, avatarColor: user.avatarColor });
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
}
