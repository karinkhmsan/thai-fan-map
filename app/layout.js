import "@/app/globals.css";
import Providers from "@/components/Providers";
import NavBar from "@/components/NavBar";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth.mjs";

export const metadata = {
  title: "FanQuestMap - แผนที่งานเกมและคอสเพลย์ทั่วไทย",
  description: "ค้นหางานแสดงสินค้า คอสเพลย์ และกิจกรรมต่างๆ ในจังหวัดของคุณ",
   icons: {
    icon: "icon.png",
  },
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="th">
      <body>
        <Providers>
          <NavBar initialUser={user} />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}