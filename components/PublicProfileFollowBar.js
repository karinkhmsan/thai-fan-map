"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import FollowStats from "./FollowStats";

// แถบ follow ของหน้าโปรไฟล์คนอื่น: ปุ่มติดตาม + ตัวเลขผู้ติดตาม/กำลังติดตาม (กดดูลิสต์ได้)
export default function PublicProfileFollowBar({ targetId, isLoggedIn, initialFollowing, initialFollowerCount, followingCount }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const router = useRouter();

  const toggleFollow = async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    setFollowing((v) => !v);
    setFollowerCount((c) => c + (following ? -1 : 1));
    const res = await fetch(`/api/users/${targetId}/follow`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
      setFollowerCount(data.followerCount);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 6, marginBottom: 4 }}>
      <FollowStats userId={targetId} followerCount={followerCount} followingCount={followingCount} />
      <button
        onClick={toggleFollow}
        style={{
          display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600,
          padding: "7px 16px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap",
          background: following ? "rgba(255,255,255,0.08)" : "#5271FF",
          border: following ? "1px solid rgba(255,255,255,0.15)" : "none",
          color: "#fff",
        }}
      >
        {following ? <UserCheck size={14} /> : <UserPlus size={14} />} {following ? "ติดตามแล้ว" : "ติดตาม"}
      </button>
    </div>
  );
}
