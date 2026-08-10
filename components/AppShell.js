"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isMapPage = pathname === "/"; // หน้าแรก = หน้าแผนที่เต็มจอ ไม่ต้องมี padding/footer ปกติ

  if (isMapPage) {
    return (
      <main style={{ margin: 0, padding: 0, maxWidth: "none", overflow: "hidden", position: "relative" }}>
        {children}

        {/* แถบลิงก์ข้อกำหนด/นโยบาย ลอยบางๆ มุมล่างซ้าย เหนือปุ่มซูมแผนที่ เพราะหน้านี้เป็นแผนที่เต็มจอไม่มีที่ให้ footer ปกติ
            (มุมขวาโดนแผงโพสต์บังบนเดสก์ท็อป และกลางล่างโดนปุ่ม "ดูโพสต์ทั้งหมด" บนมือถือ เลยเหลือมุมซ้ายที่ว่างจริงๆ) */}
        <div style={{
          position: "absolute", left: 12, bottom: 76, zIndex: 25,
          display: "flex", gap: 10, fontSize: 10.5, color: "rgba(184,174,219,0.6)",
          pointerEvents: "auto",
        }}>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>ข้อกำหนดการใช้งาน</Link>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>นโยบายความเป็นส่วนตัว</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 14px" }}>
        {children}
      </main>
      <footer style={{ textAlign: "center", padding: "40px 0 32px", color: "#8177AE", fontSize: 12 }}>
        <div style={{ marginBottom: 8 }}>FanQuestMap · 2026</div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Link href="/terms" style={{ color: "#8177AE", textDecoration: "none" }}>ข้อกำหนดการใช้งาน</Link>
          <Link href="/privacy" style={{ color: "#8177AE", textDecoration: "none" }}>นโยบายความเป็นส่วนตัว</Link>
        </div>
      </footer>
    </>
  );
}