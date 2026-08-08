"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/");
    router.refresh();
  };

  return (
    <div style={{ maxWidth: 380, margin: "40px auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 18 }}>เข้าสู่ระบบ</h1>
      <form onSubmit={submit} className="card" style={{ padding: 20, display: "grid", gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, color: "#B8AEDB", display: "block", marginBottom: 6 }}>ชื่อผู้ใช้</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#B8AEDB", display: "block", marginBottom: 6 }}>รหัสผ่าน</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: "#FF3D8A", fontSize: 13, margin: 0 }}>{error}</p>}
        <button className="btn-primary" disabled={loading}>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</button>
        <p style={{ fontSize: 13, color: "#8177AE", textAlign: "center", margin: 0 }}>
          ยังไม่มีบัญชี? <Link href="/register" style={{ color: "#FF3D8A" }}>สมัครสมาชิก</Link>
        </p>
      </form>
    </div>
  );
}
