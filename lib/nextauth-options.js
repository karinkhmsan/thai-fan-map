import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma.mjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!dbUser) {
          // ตั้งชื่อ username เริ่มต้นจากชื่อ Google หรือส่วนหน้าอีเมล
          const base = (user.name || user.email.split("@")[0])
            .trim()
            .replace(/\s+/g, "") || "user";

          // username เป็น unique field ในฐานข้อมูล ถ้าชื่อนี้มีคนใช้แล้ว
          // (ไม่ว่าจะสมัครด้วย username/password หรือ Google อีเมลอื่น)
          // ต้องหาชื่อที่ไม่ชนกันก่อน ไม่งั้น prisma.user.create จะ throw
          let username = base;
          let suffix = 0;
          while (await prisma.user.findUnique({ where: { username } })) {
            suffix += 1;
            username = `${base}${suffix}`;
          }

          await prisma.user.create({
            data: {
              email: user.email,
              username,
              avatarUrl: user.image,
            },
          });
        }
        return true;
      } catch (error) {
        // อย่าคืน true ตอน error ไม่งั้น NextAuth จะคิดว่าล็อกอินสำเร็จ
        // ทั้งที่ยังไม่มี user แถวนี้ใน DB จริงๆ (อาการปุ่มไม่เปลี่ยนที่เจอรอบก่อน)
        console.error("Google Auth Error:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
  },
};