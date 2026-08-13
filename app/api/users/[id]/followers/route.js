import { NextResponse } from "next/server";
import { listFollowers } from "@/lib/db.mjs";

export async function GET(_req, { params }) {
  const users = await listFollowers(params.id);
  return NextResponse.json({ users });
}
