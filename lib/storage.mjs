// ใช้ได้ทั้ง Cloudflare R2 และ AWS S3 เพราะสองอย่างนี้พูด API แบบเดียวกัน (S3-compatible)
// - ใช้กับ R2: ตั้งค่า S3_ENDPOINT เป็น https://<account_id>.r2.cloudflarestorage.com
// - ใช้กับ AWS S3: ปล่อย S3_ENDPOINT ว่างไว้ แล้วตั้ง S3_REGION เป็น region จริง เช่น ap-southeast-1
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;
const PUBLIC_URL = (process.env.S3_PUBLIC_URL || "").replace(/\/$/, "");

export async function uploadImage(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

export async function deleteImage(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
