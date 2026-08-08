// สคริปต์นี้ดาวน์โหลดข้อมูลแผนที่จังหวัด (GeoJSON/TopoJSON จริง) และรายชื่ออำเภอจริงทั้งประเทศ
// จากแหล่งข้อมูลโอเพนซอร์สสาธารณะ แล้วเก็บไว้ในเครื่องคุณ (ไม่ต้องดาวน์โหลดซ้ำทุกครั้งที่รันแอป)
// รันด้วยคำสั่ง: npm run setup:geo
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const files = [
  {
    // ขอบเขตจังหวัดของประเทศไทยจริง (GeoJSON แบบย่อ ~162KB) จากที่เก็บสาธารณะ apisit/thailand.json
    // ตรวจสอบเนื้อไฟล์แล้ว: แต่ละจังหวัดมี properties.name เป็นชื่อภาษาอังกฤษ เช่น "Mae Hong Son"
    url: "https://raw.githubusercontent.com/apisit/thailand.json/master/thailandWithName.json",
    dest: "public/data/thailand-provinces.geojson",
  },
  {
    // รายชื่ออำเภอทั้งหมด 928 อำเภอ พร้อมจังหวัดที่สังกัด จาก thailand-geography-data
    url: "https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/districts.json",
    dest: "data/districts-th.json",
  },
];

async function download(url, dest) {
  const full = path.join(process.cwd(), dest);
  await mkdir(path.dirname(full), { recursive: true });
  console.log(`กำลังดาวน์โหลด: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ดาวน์โหลดไม่สำเร็จ (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(full, buf);
  console.log(`บันทึกแล้ว -> ${dest} (${(buf.length / 1024).toFixed(0)} KB)`);
}

for (const f of files) {
  const full = path.join(process.cwd(), f.dest);
  if (existsSync(full)) {
    console.log(`มีอยู่แล้ว ข้าม: ${f.dest}`);
    continue;
  }
  try {
    await download(f.url, f.dest);
  } catch (err) {
    console.error(`เกิดข้อผิดพลาดกับ ${f.dest}:`, err.message);
    console.error("แอปยังใช้งานได้ปกติ แต่จะไม่มีขอบเขตแผนที่จริง/รายชื่ออำเภอจริง (จะ fallback อัตโนมัติ)");
  }
}
console.log("เสร็จสิ้นการตั้งค่าข้อมูลแผนที่");
