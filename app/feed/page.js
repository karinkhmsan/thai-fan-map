import { listEvents } from "@/lib/db.mjs";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  const events = await listEvents();
  return <FeedClient initialEvents={events} />;
}
