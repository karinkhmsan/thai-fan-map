import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";

export async function PUT(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "กรุณาล็อกอินก่อนทำรายการ" }, { status: 401 });
    }

    const { bio, avatarUrl, facebookUrl, instagramUrl, tiktokUrl } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        bio,
        avatarUrl,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "อัปเดตโปรไฟล์ไม่สำเร็จ" }, { status: 500 });
  }
}