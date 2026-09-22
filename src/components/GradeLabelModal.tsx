"use client";

import { useEffect, useMemo } from "react";
import {
  X,
  Copy,
  Link2,
  Tag,
  Barcode,
  Smartphone,
  Monitor,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { TISItem } from "@/types/tis";
import { formatPlant } from "@/lib/format";
import { useViewport } from "@/lib/useViewport";

// ===== ค่าคงที่ (hardcode) =====
const QR_URL = "https://appdb.tisi.go.th/Q/i.php?d=3828891212";
const TIS_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/a/a4/%E0%B8%A1%E0%B8%AD%E0%B8%81.svg";

// Lot แยกตาม Plant (hardcode)
// Plant 1324 ใช้ Lot 8 หลัก, Plant อื่นๆ ทั้งหมดใช้ Lot 10 หลัก
const LOT_BY_PLANT: Record<string, string> = {
  "1324": "02609036", // 8 หลัก
};

// ค่า default สำหรับ Plant อื่นๆ (ไม่ใช่ 1324) = 10 หลักเสมอ
const DEFAULT_LOT = "0260805036";

interface GradeLabelModalProps {
  item: TISItem | null;
  isDark: boolean;
  onClose: () => void;
}

export default function GradeLabelModal({
  item,
  isDark,
  onClose,
}: GradeLabelModalProps) {
  const viewport = useViewport();

  // ปิด modal ด้วย ESC
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  // คำนวณค่าที่จะแสดงบนฉลาก
  const lotNumber = useMemo(() => {
    if (!item) return DEFAULT_LOT;
    return LOT_BY_PLANT[String(item.plant)] || DEFAULT_LOT;
  }, [item]);

  const displayType = useMemo(() => {
    const raw = item?.Grade_type || "";
    return raw.startsWith("PP ") ? raw.replace("PP ", "") : raw;
  }, [item]);

  const currentTime = useMemo(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
  }, [item]);

  if (!item) return null;

  const isOk = item["Status Approved TIS"] === "OK";
  const isDesktop = viewport.isDesktop;

  const handleCopyUrl = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(QR_URL);
    } else {
      const ta = document.createElement("textarea");
      ta.value = QR_URL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    alert("คัดลอก ลิงก์ QR Code สำเร็จ!");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border flex flex-col ${
          isDesktop ? "max-w-4xl" : "max-w-lg"
        } max-h-[95vh] ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
      >
        {/* Header */}
        <div
          className={`px-3 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between shrink-0 ${
            isDark
              ? "bg-slate-900 border-slate-700"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Barcode className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3
                className={`font-bold text-sm sm:text-base truncate ${isDark ? "text-slate-100" : "text-slate-900"}`}
              >
                {isDesktop
                  ? "รายละเอียดฉลากสินค้า (TIS Product Label)"
                  : "ฉลาก มอก."}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {isDesktop ? (
                  "ข้อมูลรายละเอียดและรูปแบบฉลากสำหรับพิมพ์"
                ) : (
                  <>
                    {viewport.isPortrait ? (
                      <Smartphone className="w-3 h-3" />
                    ) : (
                      <Monitor className="w-3 h-3" />
                    )}
                    {viewport.isPortrait ? "แนวตั้ง" : "แนวนอน"} ·{" "}
                    {viewport.width}px
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-xl transition-all shrink-0 ${
              isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            }`}
            aria-label="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scroll ได้ */}
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 overflow-y-auto">
          {/* Label Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
                ตัวอย่างฉลาก
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                TIS 1306-2566
              </span>
            </div>

            {/* Printable Area — แถวเดียวเสมอ (PC / Mobile layout เหมือนกัน) */}
            <div className="overflow-x-auto -mx-1 px-1">
              <div
                id="tisPrintableLabel"
                className={`bg-white text-black rounded-lg border-2 border-slate-900 shadow-md ${
                  isDesktop ? "p-4 min-w-[680px]" : "p-2 min-w-[600px]"
                }`}
              >
                <div
                  className={`flex items-center justify-between py-1 ${
                    isDesktop ? "gap-4 px-1" : "gap-2 px-0.5"
                  }`}
                >
                  {/* 1. Grade */}
                  <div
                    className={`font-extrabold tracking-tight font-mono text-black shrink-0 whitespace-nowrap ${
                      isDesktop ? "text-4xl" : "text-2xl"
                    }`}
                  >
                    {item.Grade}
                  </div>

                  {/* 2. Lot */}
                  <div
                    className={`font-normal tracking-wider font-mono text-black shrink-0 whitespace-nowrap ${
                      isDesktop ? "text-4xl" : "text-2xl"
                    }`}
                  >
                    {lotNumber}
                  </div>

                  {/* 3. TIS Symbol & Standard */}
                  <div
                    className={`flex items-center shrink-0 ${
                      isDesktop ? "gap-2" : "gap-1"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={TIS_LOGO}
                      alt="TIS Symbol"
                      className={`w-auto object-contain shrink-0 ${
                        isDesktop ? "h-10" : "h-7"
                      }`}
                    />
                    <div
                      className={`font-semibold leading-tight font-mono text-black ${
                        isDesktop ? "text-xs" : "text-[10px]"
                      }`}
                    >
                      <div>TIS.1306-2566</div>
                      <div
                        className={`font-normal ${
                          isDesktop ? "text-[11px]" : "text-[9px]"
                        }`}
                      >
                        {item.level}
                      </div>
                    </div>
                  </div>

                  {/* 4. QR Code */}
                  <div className="shrink-0 bg-white p-0.5 sm:p-1 rounded">
                    <QRCodeSVG
                      value={QR_URL}
                      size={isDesktop ? 56 : 40}
                      level="M"
                    />
                  </div>

                  {/* 5. Type & Shift/Time */}
                  <div
                    className={`font-semibold leading-tight font-mono text-black shrink-0 whitespace-nowrap ${
                      isDesktop ? "text-xs" : "text-[10px]"
                    }`}
                  >
                    <div className="flex gap-1">
                      <span>PP</span>
                      <span>{displayType || "-"}</span>
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      <span>A</span>
                      <span>{currentTime}</span>
                    </div>
                  </div>

                  {/* 6. RoHS */}
                  <div
                    className={`font-bold font-sans text-black shrink-0 whitespace-nowrap ${
                      isDesktop ? "text-lg" : "text-sm"
                    }`}
                  >
                    (RoHS)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
            <div
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
                isDark
                  ? "bg-slate-900/60 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block font-medium">
                สถานะการอนุมัติ มอก.
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${
                    isOk
                      ? isDark
                        ? "bg-emerald-900/40 text-emerald-300 border-emerald-800"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isDark
                        ? "bg-amber-900/40 text-amber-300 border-amber-800"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {isOk ? "✓" : "⏱"} {item["Status Approved TIS"]}
                </span>
              </div>
            </div>

            <div
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
                isDark
                  ? "bg-slate-900/60 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block font-medium">
                โรงงาน / Plant
              </span>
              <span
                className={`text-xs sm:text-sm font-bold mt-0.5 block font-mono ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                Plant {formatPlant(item.plant)}
              </span>
            </div>

            <div
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border ${
                isDark
                  ? "bg-slate-900/60 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block font-medium">
                ผู้สร้างรายการ / วันที่
              </span>
              <span
                className={`text-[11px] sm:text-xs font-semibold mt-0.5 block break-words ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {item.created_by} ({item.created_at})
              </span>
            </div>
          </div>

          {/* QR URL */}
          <div
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 text-[10px] sm:text-xs ${
              isDark
                ? "bg-blue-950/40 border-blue-800/60"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
              <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span
                className={`truncate font-mono ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {QR_URL}
              </span>
            </div>
            <button
              onClick={handleCopyUrl}
              className={`px-2 py-1 rounded-lg font-medium border shrink-0 transition-all flex items-center gap-1 ${
                isDark
                  ? "bg-slate-800 text-blue-400 border-blue-700 hover:bg-blue-900/40"
                  : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              {isDesktop && "คัดลอก"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-3 sm:px-6 py-3 sm:py-4 border-t flex justify-end gap-3 shrink-0 ${
            isDark
              ? "bg-slate-900 border-slate-700"
              : "bg-slate-100 border-slate-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isDark
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
