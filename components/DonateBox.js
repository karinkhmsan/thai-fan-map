"use client";
import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { Heart, Copy, Check } from "lucide-react";

// เบอร์พร้อมเพย์ของเว็บ (ใช้รับการสนับสนุน)
const PROMPTPAY_ID = "0927454230";
const PRESET_AMOUNTS = [20, 50, 100, 300];

export default function DonateBox() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const activeAmount = customAmount ? Number(customAmount) : amount;

  // สร้าง payload ของ QR พร้อมเพย์ใหม่ทุกครั้งที่จำนวนเงินเปลี่ยน
  const payload = useMemo(() => {
    try {
      if (activeAmount && activeAmount > 0) {
        return generatePayload(PROMPTPAY_ID, { amount: activeAmount });
      }
      // ไม่ระบุจำนวน ปล่อยให้คนสแกนกรอกเองในแอปธนาคาร
      return generatePayload(PROMPTPAY_ID);
    } catch {
      return null;
    }
  }, [activeAmount]);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(PROMPTPAY_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // เบราว์เซอร์บางตัวอาจไม่รองรับ clipboard API ก็ไม่เป็นไร แค่คัดลอกไม่ได้
    }
  };

  return (
    <div className="card" style={{ padding: 24, maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
        <Heart size={20} color="#FF3D8A" fill="#FF3D8A" />
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>สนับสนุน FanQuestMap</h2>
      </div>
      <p style={{ color: "#B8AEDB", fontSize: 13, marginTop: 4, marginBottom: 20, lineHeight: 1.6 }}>
        เว็บนี้ทำและดูแลกันเองในคอมมูนิตี้ ค่าเซิร์ฟเวอร์และพื้นที่เก็บรูปมาจากแรงสนับสนุนของทุกคน
        ถ้าเว็บนี้มีประโยชน์กับคุณ ร่วมสนับสนุนกันได้ตามกำลังเลยครับ 🙏
      </p>

      {/* เลือกจำนวนเงิน */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {PRESET_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => { setAmount(a); setCustomAmount(""); }}
            className="chip"
            style={
              activeAmount === a
                ? { background: "linear-gradient(135deg,#FF3D8A,#7F49FF)", borderColor: "transparent", color: "#fff" }
                : {}
            }
          >
            {a} บาท
          </button>
        ))}
      </div>

      <input
        className="input"
        type="number"
        min="1"
        placeholder="หรือระบุจำนวนเอง (บาท)"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        style={{ marginBottom: 20, textAlign: "center" }}
      />

      {/* QR โค้ดพร้อมเพย์ */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, display: "inline-block" }}>
        {payload ? (
          <QRCodeSVG value={payload} size={200} />
        ) : (
          <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 13 }}>
            กำลังสร้าง QR...
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: "#8177AE", marginTop: 12 }}>
        สแกนด้วยแอปธนาคารเพื่อสนับสนุนผ่านพร้อมเพย์
        {activeAmount > 0 ? ` จำนวน ${activeAmount} บาท` : ""}
      </p>

      {/* เลขพร้อมเพย์ + ปุ่มคัดลอก (เผื่อโอนเอง) */}
      <div
        onClick={copyNumber}
        role="button"
        style={{
          marginTop: 14,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
          fontSize: 13,
          color: "#E4DEFF",
        }}
      >
        พร้อมเพย์: {PROMPTPAY_ID}
        {copied ? <Check size={14} color="#3BE249" /> : <Copy size={14} color="#8177AE" />}
      </div>
    </div>
  );
}