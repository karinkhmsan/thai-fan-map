import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.mjs";
import { listEventsLight, getFollowInfo } from "@/lib/db.mjs";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // กรองด้วย authorId ที่ฐานข้อมูลเลย แทนการโหลดโพสต์ของทุกคนมากรองทีหลัง
  const myEvents = await listEventsLight({ authorId: user.id });
  const { followerCount, followingCount } = await getFollowInfo(user.id, user.id);
  return <ProfileClient user={user} myEvents={myEvents} followerCount={followerCount} followingCount={followingCount} />;
}