import { NextResponse } from "next/server";
import { listFollowing } from "@/lib/db.mjs";

export async function GET(_req, { params }) {
  const users = await listFollowing(params.id);
  return NextResponse.json({ users });
}
