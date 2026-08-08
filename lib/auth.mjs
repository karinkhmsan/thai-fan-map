import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserById } from "./db.mjs";

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

// ใช้ใน Server Component / Route Handler เพื่อดึงผู้ใช้ปัจจุบันจากคุกกี้
export async function getCurrentUser() {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const uid = readUidFromToken(token);
  if (!uid) return null;
  const user = await getUserById(uid);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export const COOKIE = COOKIE_NAME;
