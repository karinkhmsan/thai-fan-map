import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma.mjs";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // 1. ค้นหาผู้ใช้ หรือสร้างใหม่หากล็อกอินครั้งแรก
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              username: user.name || user.email.split("@")[0],
              avatarUrl: user.image,
            },
          });
        }

        // 2. ออก Cookie / Session ให้ระบบเดิมรับรู้สถานะเข้าสู่ระบบ
        const cookieStore = await cookies();
        cookieStore.set("user_id", dbUser.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 วัน
        });

        return true;
      } catch (error) {
        console.error("Google Auth Error:", error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };