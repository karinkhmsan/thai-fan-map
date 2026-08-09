import DonateBox from "@/components/DonateBox";

export const metadata = {
  title: "สนับสนุนเรา - FanQuestMap",
  description: "ร่วมสนับสนุน FanQuestMap ผ่านพร้อมเพย์",
};

export default function SupportPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 14px" }}>
      <DonateBox />
    </div>
  );
}