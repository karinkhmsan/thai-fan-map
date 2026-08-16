import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// เลย์เอาต์กลางสำหรับหน้าข้อกำหนด/นโยบาย ให้หน้าตาตรงกับธีมเว็บ
export default function PolicyPage({ title, updatedAt, children }) {
  return (
    <div>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#AEB8E0", fontSize: 13, textDecoration: "none", marginBottom: 16 }}>
        <ArrowLeft size={15} /> กลับหน้าหลัก
      </Link>
      <div className="card" style={{ padding: "28px 24px", maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>{title}</h1>
        {updatedAt && <p style={{ fontSize: 12, color: "#565C99", margin: "0 0 24px" }}>ปรับปรุงล่าสุด: {updatedAt}</p>}
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#E4E9FF" }}>{children}</div>
      </div>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>{title}</h2>
      {children}
    </section>
  );
}

export function List({ items }) {
  return (
    <ul style={{ margin: "0 0 4px", paddingLeft: 20, display: "grid", gap: 6 }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}