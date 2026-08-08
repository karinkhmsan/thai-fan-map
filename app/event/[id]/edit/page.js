import { redirect } from "next/navigation";
import { getEvent } from "@/lib/db.mjs";
import { getCurrentUser } from "@/lib/auth.mjs";
import EditEventClient from "./EditEventClient";

export default async function EditEventPage({ params }) {
  const event = await getEvent(params.id);
  if (!event) redirect("/");

  const user = await getCurrentUser();
  if (!user || user.id !== event.authorId) redirect(`/event/${params.id}`);

  return <EditEventClient event={event} />;
}