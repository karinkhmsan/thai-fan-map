import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.mjs";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // เช็กสิทธิ์ ADMIN ตั้งแต่ Server ถ้าไม่ใช่ให้เด้งกลับทันที
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminClient />;
}