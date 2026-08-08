import "./globals.css";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/auth.mjs";

export const metadata = {
  title: "FanQuestMap — แผนที่งานเกมและคอสเพลย์ทั่วไทย",
  description: "รวมงานเกม งานคอสเพลย์ และกิจกรรมแฟนๆ ทั่วประเทศไทยบนแผนที่เดียว",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  return (
    <html lang="th">
      <body>
        <NavBar initialUser={user} />
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px 60px" }}>
          {children}
        </main>
        <footer style={{ textAlign: "center", padding: "18px 0", color: "#5A5182", fontSize: 12 }}>
          FanQuestMap · ข้อมูลเก็บในฐานข้อมูล Postgres จริง รูปภาพเก็บบน object storage
        </footer>
      </body>
    </html>
  );
}
