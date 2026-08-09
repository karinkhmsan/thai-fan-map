import { listEventsLight } from "@/lib/db.mjs";
import FeedClient from "./FeedClient";

// cache ไว้ 10 วิ เหมือนหน้าแรก ลดภาระฐานข้อมูลตอนมีคนเข้าฟีดพร้อมกันเยอะๆ
export const revalidate = 10;

export default async function FeedPage() {
  const events = await listEventsLight();
  return <FeedClient initialEvents={events} />;
}