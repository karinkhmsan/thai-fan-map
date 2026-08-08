import "@/app/globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/auth.mjs";

export const metadata = {
  title: "FanQuestMap - แผนที่งานเกมและคอสเพลย์ทั่วไทย",
  description: "ค้นหางานแสดงสินค้า คอสเพลย์ และกิจกรรมต่างๆ ในจังหวัดของคุณ",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="th">
      <body>
        <Providers>
          <NavBar initialUser={user} />
          <main style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 14px" }}>
            {children}
          </main>
          <footer style={{ textAlign: "center", padding: "40px 0", color: "#8177AE", fontSize: 12 }}>
            FanQuestMap · ข้อมูลเก็บในฐานข้อมูล Postgres จริง รูปภาพเก็บบน object storage
          </footer>
        </Providers>
      </body>
    </html>
  );
}