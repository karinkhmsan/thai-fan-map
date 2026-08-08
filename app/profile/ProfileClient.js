"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Trash2 } from "lucide-react";

export default function ProfileClient({ user, myEvents: initialEvents }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const remove = async (id) => {
    if (!confirm("ยืนยันลบโพสต์นี้?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div>
      <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: user.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600, flexShrink: 0 }}>
          {user.username[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 500 }}>{user.username}</div>
          <div style={{ fontSize: 12, color: "#8177AE" }}>เข้าร่วมเมื่อ {new Date(user.createdAt).toLocaleDateString("th-TH")}</div>
        </div>
        <button onClick={logout} className="btn-ghost">ออกจากระบบ</button>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <User size={16} /> โพสต์ของฉัน ({initialEvents.length})
      </h3>
      <div style={{ display: "grid", gap: 12 }}>
        {initialEvents.map((e) => (
          <div key={e.id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <Link href={`/event/${e.id}`} style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: "#B8AEDB" }}>{e.province} · {e.comments.length} ความคิดเห็น</div>
            </Link>
            <button onClick={() => remove(e.id)} style={{ background: "none", border: "none", color: "#FF3D8A", cursor: "pointer", padding: 6 }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {initialEvents.length === 0 && <p style={{ fontSize: 13, color: "#5A5182" }}>คุณยังไม่เคยโพสต์งานเลย ลองสร้างโพสต์แรกของคุณดูสิ!</p>}
      </div>
    </div>
  );
}
