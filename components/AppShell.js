"use client";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isMapPage = pathname === "/"; // หน้าแรก = หน้าแผนที่เต็มจอ ไม่ต้องมี padding/footer

  if (isMapPage) {
    return (
      <main style={{ margin: 0, padding: 0, maxWidth: "none", overflow: "hidden" }}>
        {children}
      </main>
    );
  }

  return (
    <>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 14px" }}>
        {children}
      </main>
      <footer style={{ textAlign: "center", padding: "40px 0", color: "#8177AE", fontSize: 12 }}>
        FanQuestMap · 2026
      </footer>
    </>
  );
}