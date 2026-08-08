import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.mjs";
import { listEvents } from "@/lib/db.mjs";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const all = await listEvents();
  const myEvents = all.filter((e) => e.authorId === user.id);
  return <ProfileClient user={user} myEvents={myEvents} />;
}
