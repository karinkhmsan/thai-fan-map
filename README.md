# FanQuestMap

เว็บแอปแผนที่งานเกม/คอสเพลย์/กิจกรรมแฟนคลับทั่วประเทศไทย พร้อมสำหรับ deploy ขึ้นใช้งานจริง:
- **ฐานข้อมูล**: Postgres จริงผ่าน Prisma (ใช้กับ Supabase ได้ตรงๆ)
- **รูปภาพ**: เก็บบน S3-compatible storage (Cloudflare R2 หรือ AWS S3)
- **ล็อกอิน**: bcrypt + JWT httpOnly cookie
- **โฮสต์แอป**: ออกแบบมาให้ deploy บน Vercel ได้ทันที

## สิ่งที่ต้องเตรียมก่อน (บัญชีฟรีพอสำหรับเริ่มต้น)

1. **Node.js** (18 ขึ้นไป) — มีอยู่แล้ว
2. **บัญชี Supabase** (ฟรี) — สำหรับฐานข้อมูล Postgres → https://supabase.com
3. **บัญชี Cloudflare** (ฟรี) — สำหรับเก็บรูปด้วย R2 → https://dash.cloudflare.com (หรือจะใช้ AWS S3 แทนก็ได้)
4. **บัญชี Vercel** (ฟรี) — สำหรับ deploy แอป → https://vercel.com
5. **บัญชี GitHub** — สำหรับเก็บโค้ดแล้วเชื่อมเข้า Vercel

## ขั้นตอนที่ 1: ตั้งค่าฐานข้อมูล (Supabase)

1. สร้างโปรเจกต์ใหม่ใน Supabase (จำรหัสผ่าน database ที่ตั้งไว้ให้ดี)
2. ไปที่ **Project Settings → Database → Connection string**
3. คัดลอก connection string สองแบบ:
   - **Transaction pooler** (พอร์ต 6543) → ใช้เป็นค่า `DATABASE_URL`
   - **Direct connection** (พอร์ต 5432) → ใช้เป็นค่า `DIRECT_URL`

## ขั้นตอนที่ 2: ตั้งค่าที่เก็บรูป (Cloudflare R2)

1. ใน Cloudflare Dashboard ไปที่ **R2 Object Storage** → สร้าง bucket ใหม่ เช่น `fanquestmap-uploads`
2. เปิด **public access** ให้ bucket (Settings ของ bucket → Public Access → Allow) จะได้โดเมนแบบ `https://pub-xxxx.r2.dev` — เก็บไว้ใช้เป็น `S3_PUBLIC_URL`
3. ไปที่ **R2 → Manage API Tokens** → สร้าง API token ที่มีสิทธิ์ Read & Write → จะได้ Access Key ID และ Secret Access Key
4. หา Account ID ของคุณ (มุมขวาบนของ R2 dashboard) → ใช้ประกอบเป็น `S3_ENDPOINT`:
   `https://<account_id>.r2.cloudflarestorage.com`

(ถ้าอยากใช้ AWS S3 แทน R2: สร้าง bucket ตั้งค่า public read policy แล้วปล่อย `S3_ENDPOINT` ว่างไว้ ตั้ง `S3_REGION` เป็น region จริง และ `S3_PUBLIC_URL` เป็น `https://<bucket>.s3.<region>.amazonaws.com`)

## ขั้นตอนที่ 3: รันในเครื่องเพื่อทดสอบก่อน deploy

```bash
cd thai-fan-map
npm install                 # ติดตั้งไลบรารี + สร้าง Prisma client อัตโนมัติ

cp .env.example .env
# เปิดไฟล์ .env แล้วกรอกค่าจริงทั้งหมด: JWT_SECRET, DATABASE_URL, DIRECT_URL, S3_*

npm run db:push             # สร้างตารางจริงในฐานข้อมูล Supabase
npm run setup:geo           # โหลดข้อมูลแผนที่จังหวัด + รายชื่ออำเภอจริง

npm run dev
```

เปิด http://localhost:3000 ทดสอบสมัครสมาชิก โพสต์งาน อัปโหลดรูป ให้แน่ใจว่าทุกอย่างทำงาน (รูปควรไปโผล่ใน R2 bucket จริง ข้อมูลโพสต์ควรไปโผล่ใน Supabase จริง — เข้าไปดูได้ในหน้า Table Editor ของ Supabase)

## ขั้นตอนที่ 4: Deploy ขึ้น Vercel

1. Push โค้ดทั้งโปรเจกต์ขึ้น GitHub repo ใหม่
2. เข้า Vercel → **Add New Project** → เลือก repo นี้
3. Vercel จะรู้จัก Next.js เองอัตโนมัติ ไม่ต้องตั้งค่า build command เพิ่ม
4. ในหน้า **Environment Variables** ใส่ค่าทั้งหมดจากไฟล์ `.env` ของคุณ (JWT_SECRET, DATABASE_URL, DIRECT_URL, S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL)
5. กด **Deploy**

เนื่องจากตารางฐานข้อมูลถูกสร้างไว้แล้วในขั้นตอนที่ 3 (`npm run db:push` ชี้ไปที่ Supabase ตัวเดียวกับที่ Vercel จะใช้) จึงไม่ต้องรัน migration อะไรเพิ่มบน Vercel — deploy เสร็จก็ใช้งานได้ทันทีที่โดเมนที่ Vercel ให้มา

หลังจากนี้ทุกครั้งที่ push โค้ดใหม่ขึ้น GitHub, Vercel จะ build และ deploy เวอร์ชันใหม่ให้อัตโนมัติ

## ถ้าแก้สคีมาฐานข้อมูลภายหลัง

แก้ไฟล์ `prisma/schema.prisma` แล้วรัน:
```bash
npm run db:push
```
(ใช้ `DIRECT_URL` เชื่อมตรงตอนรันคำสั่งนี้ ต้องมีค่านี้ใน `.env` เสมอ)

ดูข้อมูลในฐานข้อมูลผ่านหน้าเว็บได้ด้วย:
```bash
npm run db:studio
```

## หมายเหตุเรื่องแผนที่

ไฟล์ขอบเขตจังหวัด (`public/data/thailand-provinces.geojson`) ดาวน์โหลดจาก repo สาธารณะ apisit/thailand.json ซึ่งตรวจสอบแล้วว่าแต่ละจังหวัดมี `properties.name` เป็นชื่อภาษาอังกฤษ (เช่น "Mae Hong San") — โค้ดใน `components/ThailandMap.js` จับคู่ชื่อนี้กับชื่อจังหวัดภาษาไทยให้อัตโนมัติ ไม่ว่ากรณีใดหมุดปักตำแหน่งงานจะแสดงถูกต้องเสมอเพราะคำนวณจากพิกัดแยกต่างหาก
