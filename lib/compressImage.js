// บีบอัดรูปฝั่ง browser ก่อนอัปโหลด (resize + ลด quality เป็น JPEG)
// เหตุผล: Vercel Function จำกัด request body ไว้ที่ 4.5MB แบบแก้ผ่านโค้ด/vercel.json ไม่ได้
// รูปจากมือถือมักมีขนาด 3-8MB/รูป ถ้าส่งดิบๆ 4-6 รูปพร้อมกันจะเกินลิมิตทันที
export async function compressImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.75 } = {}) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export async function compressImages(files, options) {
  const out = [];
  for (const f of files) out.push(await compressImage(f, options));
  return out;
}