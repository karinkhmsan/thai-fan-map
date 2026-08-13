import { listEventsLight, attachLikedFlag } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";
import FeedClient from "./FeedClient";

// หมายเหตุ: ฝัง isLiked ของผู้ใช้ปัจจุบันมากับโพสต์ตั้งแต่ฝั่ง server เลย (query เดียวรวด)
// แทนที่จะปล่อยให้การ์ดแต่ละใบยิง fetch เช็คสถานะไลค์ทีละใบ (เดิมคือสาเหตุหลักที่หน้านี้ช้า)
export default async function FeedPage() {
  const [events, user] = await Promise.all([listEventsLight(), getCurrentUser()]);
  const eventsWithLiked = await attachLikedFlag(events, user?.id);
  return <FeedClient initialEvents={eventsWithLiked} />;
}