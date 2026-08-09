"use client";
import { useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import generatePayload from "promptpay-qr";
import { Heart, Copy, Check, Upload, X, ExternalLink } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

// เบอร์พร้อมเพย์ของเว็บ (ใช้รับการสนับสนุน)
const PROMPTPAY_ID = "0927454230";
const PRESET_AMOUNTS = [20, 50, 100, 300];
const EASYDONATE_URL = "https://ezdn.app/fanquestmap";

export default function DonateBox({ currentUser }) {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);

  // ฟอร์มแนบสลิปยืนยันการโอน
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [donorName, setDonorName] = useState(currentUser?.username || "");
  const [slipAmount, setSlipAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

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

  const pickSlip = async (file) => {
    if (!file) return;
    // บีบอัดก่อนอัปโหลด เหมือนตอนโพสต์รูปงาน แต่ใช้ quality สูงกว่า/ไม่ย่อเล็กเกินไป
    // เพราะสลิปต้องอ่านตัวเลขในรูปออกให้ชัด ไม่ใช่แค่ดูสวย
    const compressed = await compressImage(file, { maxWidth: 1800, maxHeight: 1800, quality: 0.85 });
    setSlipFile(compressed);
    const reader = new FileReader();
    reader.onload = () => setSlipPreview(reader.result);
    reader.readAsDataURL(compressed);
  };

  const submitSlip = async () => {
    setSubmitError("");
    if (!slipFile) { setSubmitError("กรุณาแนบรูปสลิปโอนเงินก่อน"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("slip", slipFile);
      if (donorName.trim()) fd.append("name", donorName.trim());
      if (slipAmount) fd.append("amount", slipAmount);
      const res = await fetch("/api/donations", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ส่งสลิปไม่สำเร็จ");
      setSubmitted(true);
      setSlipFile(null);
      setSlipPreview(null);
      setSlipAmount("");
    } catch (e) {
      setSubmitError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card donate-card" style={{ padding: 24, maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
        <Heart size={20} color="#FF3D8A" fill="#FF3D8A" />
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>สนับสนุน FanQuestMap</h2>
      </div>
      <p style={{ color: "#B8AEDB", fontSize: 13, marginTop: 4, marginBottom: 20, lineHeight: 1.6 }}>
        เว็บนี้ทำและดูแลกันเองในคอมมูนิตี้ ค่าเซิร์ฟเวอร์และพื้นที่เก็บรูปมาจากแรงสนับสนุนของทุกคน
        ถ้าเว็บนี้มีประโยชน์กับคุณ ร่วมสนับสนุนกันได้ตามกำลังเลยครับ 🙏
      </p>

      {/* ทางหลัก: ผ่าน EasyDonate — ยืนยันอัตโนมัติ ขึ้นชื่อในหน้าสถิติทันทีไม่ต้องรอแอดมิน */}
      <a
        href={EASYDONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "13px 16px", borderRadius: 12, marginBottom: 20,
          background: "linear-gradient(135deg,#FF3D8A,#7F49FF)", color: "#fff",
          fontSize: 15, fontWeight: 700, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(255,61,138,0.35)",
        }}
      >
        <Heart size={17} fill="#fff" /> โดเนทผ่าน EasyDonate <ExternalLink size={14} />
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 18px", color: "#5A5182", fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        หรือสแกน QR พร้อมเพย์เอง
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      </div>

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
          marginBottom: 24,
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

      {/* ฟอร์มแนบสลิปเพื่อยืนยันการโอน */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, textAlign: "left" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>โอนผ่านพร้อมเพย์เอง? แนบสลิปยืนยันตรงนี้</h3>
        <p style={{ fontSize: 12, color: "#8177AE", margin: "0 0 14px", lineHeight: 1.6 }}>
          ถ้าไม่สะดวกผ่าน EasyDonate ด้านบน สแกน QR พร้อมเพย์ได้เลย แต่ระบบไม่รู้อัตโนมัติว่าใครโอนมา
          ต้องแนบสลิปไว้ให้แอดมินตรวจสอบและกดยืนยันก่อน ถึงจะขึ้นชื่อในรายชื่อผู้สนับสนุน (ดูได้จากเมนู 3 ขีด → สถิติ)
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>เมื่อได้บริจาคหรือสนับสนุน แสดงว่าคุณยอมรับ ข้อกำหนดการใช้งานของเรา</h3>

        {submitted ? (
          <div style={{ background: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#4CAF50", textAlign: "center" }}>
            ส่งสลิปเรียบร้อยแล้ว ขอบคุณที่สนับสนุนครับ 🙏 <br />
            รอแอดมินตรวจสอบและยืนยันสักครู่
          </div>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 12, color: "#B8AEDB", marginBottom: 6 }}>ชื่อที่จะแสดง (ถ้าไม่กรอกจะขึ้นว่า "ผู้สนับสนุนนิรนาม")</label>
            <input
              className="input"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="เช่น ชื่อเล่นหรือชื่อที่อยากให้โชว์"
              style={{ marginBottom: 12 }}
            />

            <label style={{ display: "block", fontSize: 12, color: "#B8AEDB", marginBottom: 6 }}>จำนวนเงินที่โอน (บาท) — ใช้ให้แอดมินเช็คกับสลิปเท่านั้น</label>
            <input
              className="input"
              type="number"
              min="1"
              value={slipAmount}
              onChange={(e) => setSlipAmount(e.target.value)}
              placeholder="เช่น 50"
              style={{ marginBottom: 12 }}
            />

            <label style={{ display: "block", fontSize: 12, color: "#B8AEDB", marginBottom: 6 }}>รูปสลิปโอนเงิน</label>
            {slipPreview ? (
              <div style={{ position: "relative", width: 110, height: 110, marginBottom: 12 }}>
                <img src={slipPreview} alt="สลิป" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                <button
                  type="button"
                  onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                  style={{ position: "absolute", top: -6, right: -6, background: "#FF3D8A", border: "none", borderRadius: "50%", width: 20, height: 20, color: "#fff", cursor: "pointer" }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                style={{ width: "100%", padding: "16px 12px", borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: "#8177AE", fontSize: 13, marginBottom: 12 }}
              >
                <Upload size={16} /> แตะเพื่อเลือกรูปสลิป
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickSlip(e.target.files?.[0])} />

            {submitError && <p style={{ color: "#FF3D8A", fontSize: 12, margin: "0 0 10px" }}>{submitError}</p>}

            <button
              onClick={submitSlip}
              disabled={submitting}
              className="btn-primary"
              style={{ width: "100%", padding: 11, fontSize: 14, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "กำลังส่ง..." : "ส่งสลิปยืนยันการโอน"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}