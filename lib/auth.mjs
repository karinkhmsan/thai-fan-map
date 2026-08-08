import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./nextauth-options.mjs";
import { getUserById, getUserByEmail } from "./db.mjs";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-.env";
const COOKIE_NAME = "fq_session";

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

export function signSession(userId) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: "30d" });
}

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function readUidFromToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    return payload.uid;
  } catch {
    return null;
  }
}

// ใช้ใน Server Component / Route Handler เพื่อดึงผู้ใช้ปัจจุบัน
// เช็กระบบเดิม (username/password) ก่อน ถ้าไม่มีค่อยเช็ก session ของ Google (NextAuth)
export async function getCurrentUser() {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    const uid = readUidFromToken(token);
    if (uid) {
      const user = await getUserById(uid);
      if (user) {
        const { passwordHash, ...safe } = user;
        return safe;
      }
    }
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await getUserByEmail(session.user.email);
    if (user) {
      const { passwordHash, ...safe } = user;
      return safe;
    }
  }

  return null;
}

export const COOKIE = COOKIE_NAME;