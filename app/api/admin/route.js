import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";
import { listReportedComments, adminDeleteComment, listPendingDonations, setDonationStatus, updateDonationAmount } from "@/lib/db.mjs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, isBanned: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const events = await prisma.event.findMany({
    include: { author: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  const reportedComments = await listReportedComments();
  const pendingDonations = await listPendingDonations();

  return NextResponse.json({ users, events, reportedComments, pendingDonations });
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 403 });
  }

  const { action, userId, eventId, commentId, donationId, amount } = await req.json();

  if (action === "toggleBan") {
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !target.isBanned },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "deleteEvent") {
    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ success: true });
  }

  if (action === "deleteComment") {
    const ok = await adminDeleteComment(commentId);
    if (!ok) return NextResponse.json({ error: "ไม่พบความคิดเห็นนี้" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  if (action === "approveDonation") {
    await setDonationStatus(donationId, "APPROVED");
    return NextResponse.json({ success: true });
  }

  if (action === "rejectDonation") {
    await setDonationStatus(donationId, "REJECTED");
    return NextResponse.json({ success: true });
  }

  if (action === "updateDonationAmount") {
    await updateDonationAmount(donationId, amount ? Math.round(Number(amount)) : null);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
}