import { getEvent } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";
import EventDetailClient from "./EventDetailClient";

export default async function EventPage({ params }) {
  const event = await getEvent(params.id);
  const user = await getCurrentUser();
  if (!event) {
    return <p style={{ color: "#8177AE" }}>ไม่พบโพสต์นี้ อาจถูกลบไปแล้ว</p>;
  }
  return <EventDetailClient event={event} currentUser={user} />;
}
