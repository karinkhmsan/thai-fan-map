// เดิมไฟล์นี้เก็บข้อมูลลง data/store.json ในเครื่อง — ตอนนี้เปลี่ยนไปใช้ฐานข้อมูล Postgres จริงผ่าน Prisma
// ชื่อฟังก์ชันที่ export เหมือนเดิมทุกตัว ดังนั้น API routes ที่เรียกใช้ไฟล์นี้ไม่ต้องแก้อะไรเลย
import { prisma } from "./prisma.mjs";

const dateFmt = (d) =>
  new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

function formatComment(c) {
  return {
    id: c.id,
    authorId: c.authorId,
    authorName: c.author.username,
    text: c.text,
    createdAt: dateFmt(c.createdAt),
  };
}

function formatEvent(e) {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    province: e.province,
    district: e.district,
    description: e.description,
    images: e.images,
    authorId: e.authorId,
    authorName: e.author.username,
    authorAvatarUrl: e.author.avatarUrl,
    authorAvatarColor: e.author.avatarColor,
    createdAt: dateFmt(e.createdAt),
    comments: (e.comments || []).map(formatComment),
  };
}

const EVENT_INCLUDE = {
  author: true,
  comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
};

export async function getUserByUsername(username) {
  return prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
  });
}
export async function getUserByEmail(email) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(user) {
  return prisma.user.create({ data: user });
}

export async function listEvents() {
  const events = await prisma.event.findMany({
    include: EVENT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return events.map(formatEvent);
}

export async function getEvent(id) {
  const event = await prisma.event.findUnique({ where: { id }, include: EVENT_INCLUDE });
  return event ? formatEvent(event) : null;
}

export async function createEvent(event) {
  const created = await prisma.event.create({
    data: {
      id: event.id,
      title: event.title,
      category: event.category,
      province: event.province,
      district: event.district,
      description: event.description,
      images: event.images,
      authorId: event.authorId,
    },
    include: EVENT_INCLUDE,
  });
  return formatEvent(created);
}

export async function updateEvent(id, authorId, data) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing || existing.authorId !== authorId) return null;
  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      category: data.category,
      province: data.province,
      district: data.district,
      description: data.description,
      images: data.images,
    },
    include: EVENT_INCLUDE,
  });
  return formatEvent(updated);
}

export async function deleteEvent(id, authorId) {
  const { count } = await prisma.event.deleteMany({ where: { id, authorId } });
  return count > 0;
}

export async function addComment(eventId, comment) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;
  await prisma.comment.create({
    data: { id: comment.id, text: comment.text, eventId, authorId: comment.authorId },
  });
  const updated = await prisma.event.findUnique({ where: { id: eventId }, include: EVENT_INCLUDE });
  return formatEvent(updated);
}

// ลบคอมเมนต์: ลบได้เฉพาะเจ้าของคอมเมนต์เอง หรือแอดมิน (isAdmin=true)
export async function deleteComment(commentId, userId, isAdmin) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return null;
  if (comment.authorId !== userId && !isAdmin) return null;

  await prisma.comment.delete({ where: { id: commentId } });
  const updated = await prisma.event.findUnique({ where: { id: comment.eventId }, include: EVENT_INCLUDE });
  return updated ? formatEvent(updated) : null;
}

// รายงานคอมเมนต์ — รายงานซ้ำจากคนเดิมจะถูกกันด้วย @@unique([commentId, reporterId]) ในสคีมา
export async function reportComment(commentId, reporterId) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return null;
  try {
    await prisma.commentReport.create({ data: { commentId, reporterId } });
  } catch (err) {
    if (err.code !== "P2002") throw err; // P2002 = รายงานซ้ำ ปล่อยผ่านเงียบๆ
  }
  return { ok: true };
}

// ใช้ในหน้า Admin: รายการคอมเมนต์ที่มีคนรายงานอย่างน้อย 1 ครั้ง เรียงจากรายงานเยอะสุดก่อน
export async function listReportedComments() {
  const comments = await prisma.comment.findMany({
    where: { reports: { some: {} } },
    include: {
      author: { select: { username: true } },
      event: { select: { id: true, title: true } },
      reports: true,
    },
  });
  return comments
    .map((c) => ({
      id: c.id,
      text: c.text,
      authorId: c.authorId,
      authorName: c.author.username,
      eventId: c.event?.id,
      eventTitle: c.event?.title,
      reportCount: c.reports.length,
      createdAt: dateFmt(c.createdAt),
    }))
    .sort((a, b) => b.reportCount - a.reportCount);
}

// ใช้ในหน้า Admin: ลบคอมเมนต์ได้โดยไม่ต้องเช็กเจ้าของ (route ที่เรียกต้องเช็ก role ADMIN เองก่อน)
export async function adminDeleteComment(commentId) {
  const { count } = await prisma.comment.deleteMany({ where: { id: commentId } });
  return count > 0;
}