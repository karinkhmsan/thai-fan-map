// ป้องกันการสร้าง PrismaClient ซ้ำหลายตัวตอน dev (hot reload) ซึ่งทำให้ connection ล้น
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
