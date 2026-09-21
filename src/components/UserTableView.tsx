"use client";

import { useState, useMemo } from "react";
import { TISGradeModel } from "@/models/TISGradeModel";
import { Search, Filter, RefreshCw, Clock } from "lucide-react";

interface UserTableViewProps {
  data: TISGradeModel[];
  loading: boolean;
  lastUpdated?: string | null;
  onRefresh?: () => void;
}

// Helper Function กำหนดสี Badge ตาม Plant
const getPlantBadgeClass = (plant: string | number) => {
  const plantStr = String(plant || "").trim();

  switch (plantStr) {
    case "1311":
    case "1312":
      // Light Mode: ขอบหนา 2px สีเขียวเข้ม + ข้อความสีเขียวเข้ม
      return "bg-emerald-50 text-emerald-900 border-2 border-emerald-500 font-bold dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800";
    case "1324":
    case "1300":
      return "bg-blue-50 text-blue-900 border-2 border-blue-500 font-bold dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";
    case "1325":
    case "1400":
      return "bg-indigo-50 text-indigo-900 border-2 border-indigo-500 font-bold dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800";
    case "1326":
    case "1500":
      return "bg-purple-50 text-purple-900 border-2 border-purple-500 font-bold dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800";
    case "1327":
      return "bg-pink-50 text-pink-900 border-2 border-pink-500 font-bold dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800";
    case "1328":
      return "bg-teal-50 text-teal-900 border-2 border-teal-500 font-bold dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800";
    default:
      return "bg-slate-100 text-slate-900 border-2 border-slate-400 font-bold dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  }
};

export default function UserTableView({
  data,
  loading,
  lastUpdated,
  onRefresh,
}: UserTableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("ALL");

  // ดึงรายการ Plant ทั้งหมดแบบไม่ซ้ำ
  const plantOptions = useMemo(() => {
    const plants = data.map((item) => String(item.plant || "")).filter(Boolean);
    return Array.from(new Set(plants)).sort();
  }, [data]);

  // กรองข้อมูลตามเงื่อนไข Grade และ Plant
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesGrade = item.grade
        ?.toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const matchesPlant =
        selectedPlant === "ALL" || String(item.plant) === selectedPlant;

      return matchesGrade && matchesPlant;
    });
  }, [data, searchTerm, selectedPlant]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      {/* ส่วนหัว และปุ่ม Manual Refresh */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Grade List (Public View)
            </h2>
            {lastUpdated && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <Clock className="w-3.5 h-3.5" />
                อัปเดตล่าสุดเมื่อ:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {lastUpdated}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              พบ {filteredData.length} จาก {data.length} รายการ
            </span>

            {/* ปุ่ม Manual Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-50"
                title="กดเพื่อดึงข้อมูลสดใหม่จากระบบ"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "กำลังโหลด..." : "รีเฟรชข้อมูล"}
              </button>
            )}
          </div>
        </div>

        {/* แถบตัวกรอง: ค้นหาตาม Grade และ เลือก Plant */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* ช่องค้นหาตาม Grade */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาตาม Grade (เช่น B1101, BC03B)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Dropdown เลือก Plant */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 appearance-none cursor-pointer"
            >
              <option value="ALL">เลือก Plant (ทั้งหมด)</option>
              {plantOptions.map((plant) => (
                <option key={plant} value={plant}>
                  Plant {plant}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ส่วนตารางแสดงผล */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-700 text-white dark:bg-slate-900 border-b-2 border-blue-800 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">
  <tr>
    <th className="py-3.5 px-4">Grade</th>
    <th className="py-3.5 px-4">Grade Type</th>
    <th className="py-3.5 px-4">Plant</th>
    <th className="py-3.5 px-4">Level</th>
    <th className="py-3.5 px-4">TIS Status</th>
    <th className="py-3.5 px-4">Active Status</th>
  </tr>
</thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  ไม่พบข้อมูลที่ตรงกับการค้นหา
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {item.grade}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {item.gradeType}
                  </td>
                  {/* Badge แยกสีตาม Plant */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getPlantBadgeClass(
                        item.plant,
                      )}`}
                    >
                      {item.plant}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {item.level}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.tisStatus === "OK"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {item.tisStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.activeStatus === "Active"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.activeStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
