import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const FILE = path.join(process.cwd(), "data", "districts-th.json");
let cache = null;

export async function GET(req) {
  const province = new URL(req.url).searchParams.get("province");
  if (!province) return NextResponse.json({ districts: [] });

  if (!existsSync(FILE)) {
    // ยังไม่ได้รัน `npm run setup:geo` — ใช้ช่องกรอกข้อความอิสระแทน
    return NextResponse.json({ districts: [], sourceMissing: true });
  }
  if (!cache) {
    cache = JSON.parse(await readFile(FILE, "utf-8"));
  }
  const districts = cache
    .filter((d) => d.provinceNameTh === province)
    .map((d) => d.districtNameTh)
    .sort((a, b) => a.localeCompare(b, "th"));

  return NextResponse.json({ districts });
}
