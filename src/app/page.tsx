"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  RotateCw,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  Moon,
  Sun,
  LogOut,
  LogIn,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { TISItem } from "@/types/tis";
import { TISApiService } from "@/services/TISApiService";
import { signIn, signOut, useSession } from "next-auth/react";

const STORAGE_KEY = "tis_grades_data";
const LAST_UPDATED_KEY = "tis_grades_last_updated";
const THEME_KEY = "tis_theme";

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const [activeTab, setActiveTab] = useState<"view" | "admin">("view");
  const [grades, setGrades] = useState<TISItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<string>("ALL");

  // State สำหรับ Sort หัวตาราง (คลิกหัวตารางเพื่อสลับ asc/desc)
  const [sortKey, setSortKey] = useState<"plant" | "grade" | null>("plant");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<TISItem>({
    Grade: "",
    "Status Approved TIS": "N/A",
    level: "",
    plant: 1324,
    created_at: "",
    updated_at: "",
    created_by: "Admin",
    updated_by: "",
    is_active: "Active",
    Grade_type: "",
  });

  // โหลด Theme จาก localStorage
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
    setTheme(savedTheme);
  }, []);

  // ถ้าไม่ได้ login อยู่ ให้บังคับกลับแท็บ Data View (ซ่อน Admin CRUD)
  useEffect(() => {
    if (status === "unauthenticated" && activeTab === "admin") {
      setActiveTab("view");
    }
  }, [status, activeTab]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  };

  // โหลดข้อมูลจาก localStorage
  const loadGradesFromStorage = () => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const storedTime = localStorage.getItem(LAST_UPDATED_KEY);

      if (storedData) {
        const parsed = JSON.parse(storedData);
        let list: TISItem[] = [];

        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          Object.keys(parsed).forEach((key) => {
            if (Array.isArray(parsed[key])) {
              list = list.concat(parsed[key]);
            }
          });
        } else if (Array.isArray(parsed)) {
          list = parsed;
        }

        const normalizedData: TISItem[] = list.map((item: any) => ({
          Grade: item.Grade || item.grade || "",
          Grade_type:
            item.Grade_type || item.gradeType || item.grade_type || "",
          plant: Number(item.plant) || 0,
          level: item.level || "",
          "Status Approved TIS":
            item["Status Approved TIS"] || item.tisStatus || "N/A",
          is_active: item.is_active || item.isActive || "Active",
          created_at: item.created_at || "",
          updated_at: item.updated_at || "",
          created_by: item.created_by || "Admin",
          updated_by: item.updated_by || "",
        }));

        setGrades(normalizedData);
      } else {
        setGrades([]);
      }

      if (storedTime) {
        setLastUpdated(storedTime);
      } else {
        setLastUpdated(new Date().toLocaleString("th-TH"));
      }
    } catch (error) {
      console.error("Failed to load grades from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลสดจาก API แล้วบันทึกลง localStorage
  const fetchFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("[TIS] กำลังดึงข้อมูลจาก GAS API...");
      const models = await TISApiService.fetchFromApi();
      console.log("[TIS] ดึงข้อมูลสำเร็จ:", models.length, "รายการ");

      // เซฟลง localStorage ด้วย key เดียวกัน (tis_grades_data)
      const updatedTime = TISApiService.setCachedData(models);

      // อ่านกลับจาก localStorage มาอัปเดต state ให้เป็นรูปแบบที่หน้าจอใช้
      loadGradesFromStorage();
      setLastUpdated(updatedTime);
    } catch (error) {
      console.error("[TIS] ดึงข้อมูลจาก GAS API ไม่สำเร็จ:", error);
      // fallback: แสดงข้อมูลเดิมจาก localStorage ถ้ามี
      loadGradesFromStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // เริ่มต้น: ถ้ามีข้อมูลใน localStorage ให้แสดงเลย, ถ้าไม่มีค่อยดึงจาก API
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      loadGradesFromStorage();
    } else {
      fetchFromApi();
    }
  }, [fetchFromApi]);

  const saveToStorage = (updatedGrades: TISItem[]) => {
    const nowStr = new Date().toLocaleString("th-TH");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGrades));
    localStorage.setItem(LAST_UPDATED_KEY, nowStr);
    setGrades(updatedGrades);
    setLastUpdated(nowStr);
  };

  // ป้องกัน Error เวลาเป็น null/undefined ด้วย Optional Chaining
  // และทำการ Sort ตามคอลัมน์ที่เลือก (คลิกหัวตารางได้)
  const filteredGrades = grades
    .filter((item) => {
      const matchesSearch =
        (item.Grade || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Grade_type || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesPlant =
        selectedPlant === "ALL" ||
        (item.plant && item.plant.toString() === selectedPlant);
      return matchesSearch && matchesPlant;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const dir = sortDir === "asc" ? 1 : -1;

      if (sortKey === "plant") {
        const plantA = Number(a.plant) || 0;
        const plantB = Number(b.plant) || 0;
        if (plantA !== plantB) return (plantA - plantB) * dir;
        // ถ้า Plant เท่ากัน ให้เรียงตาม Grade ต่อ
        return (a.Grade || "").localeCompare(b.Grade || "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      // sortKey === "grade"
      const gradeCmp = (a.Grade || "").localeCompare(b.Grade || "", undefined, {
        numeric: true,
        sensitivity: "base",
      });
      if (gradeCmp !== 0) return gradeCmp * dir;
      // ถ้า Grade เท่ากัน ให้เรียงตาม Plant ต่อ
      return ((Number(a.plant) || 0) - (Number(b.plant) || 0)) * dir;
    });

  // ฟังก์ชันสลับการ Sort เมื่อคลิกหัวตาราง
  const handleSort = (key: "plant" | "grade") => {
    if (sortKey === key) {
      // คลิกซ้ำคอลัมน์เดิม → สลับ asc/desc
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // คลิกคอลัมน์ใหม่ → เริ่มที่ asc
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ไอคอนลูกศรบอกทิศทาง Sort
  const renderSortIcon = (key: "plant" | "grade") => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  };

  const uniquePlants = Array.from(
    new Set(grades.map((item) => item.plant)),
  ).filter(Boolean);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      Grade: "",
      "Status Approved TIS": "N/A",
      level: "",
      plant: 1324,
      created_at: "",
      updated_at: "",
      created_by: "Admin",
      updated_by: "",
      is_active: "Active",
      Grade_type: "PP HOMO",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: TISItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setFormData(item);
    setIsFormOpen(true);
  };

  const handleSoftDelete = (targetItem: TISItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        `คุณต้องการเปลี่ยนสถานะ Grade: ${targetItem.Grade} (Plant: ${targetItem.plant}) เป็น Inactive ใช่หรือไม่?`,
      )
    ) {
      const updated = grades.map((item) =>
        item.Grade === targetItem.Grade && item.plant === targetItem.plant
          ? {
              ...item,
              is_active: "Inactive",
              updated_at: new Date().toLocaleString("th-TH"),
            }
          : item,
      );
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleString("th-TH");

    let updatedGrades: TISItem[] = [];
    if (isEditMode) {
      // เทียบทั้ง Grade และ Plant เพื่อป้องกันกรณีชื่อ Grade ซ้ำกันคนละ Plant
      updatedGrades = grades.map((item) =>
        item.Grade === formData.Grade && item.plant === Number(formData.plant)
          ? {
              ...formData,
              plant: Number(formData.plant),
              updated_at: now,
              updated_by: "Admin",
            }
          : item,
      );
    } else {
      const newPayload: TISItem = {
        ...formData,
        plant: Number(formData.plant),
        created_at: now,
        created_by: "Admin",
        updated_at: "NULL",
        updated_by: "NULL",
      };
      updatedGrades = [newPayload, ...grades];
    }

    saveToStorage(updatedGrades);
    setIsFormOpen(false);
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? "bg-slate-900 text-slate-100" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`border-b px-6 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors ${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black text-blue-500 tracking-tight">
            IRPC TIS System
          </h1>
          <div
            className={`flex p-1 rounded-xl border ${
              isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={() => setActiveTab("view")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "view"
                  ? isDark
                    ? "bg-slate-800 text-blue-400 shadow-sm"
                    : "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Data View
            </button>
            {isAuthed && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === "admin"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Admin CRUD
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all ${
              isDark
                ? "border-slate-700 bg-slate-700 text-amber-400 hover:bg-slate-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {isAuthed ? (
            <>
              <div
                className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
                title={session?.user?.email || ""}
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 object-cover"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {(session?.user?.name || session?.user?.email || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <span className="hidden md:inline max-w-[160px] truncate">
                  {session?.user?.name || session?.user?.email || "ผู้ใช้"}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 font-semibold border border-rose-500/20"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 font-semibold border border-blue-500/20"
            >
              <LogIn className="w-4 h-4" /> Sign in with Google
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {activeTab === "view" ? (
          /* ===== TAB 1: DATA VIEW ===== */
          <div
            className={`rounded-2xl p-6 shadow-sm border transition-colors ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                >
                  Grade List (Public View)
                </h2>
                <p className="text-xs text-slate-400">
                  อัปเดตล่าสุดเมื่อ: {lastUpdated}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                    isDark
                      ? "bg-slate-700 text-slate-300 border-slate-600"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  พบ {filteredGrades.length} จาก {grades.length} รายการ
                </span>
                <button
                  onClick={fetchFromApi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 font-semibold border border-blue-500/20"
                >
                  <RotateCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />{" "}
                  รีเฟรชข้อมูล
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาตาม Grade (เช่น B1101, BC03B)..."
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                />
              </div>
              <div className="relative flex items-center">
                <Filter className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                <select
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className={`pl-9 pr-8 py-2 border rounded-xl text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <option value="ALL">เลือก Plant (ทั้งหมด)</option>
                  {uniquePlants.map((plant) => (
                    <option key={plant} value={plant}>
                      Plant: {plant}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium">
                  กำลังโหลดข้อมูล Grade ทั้งหมด...
                </p>
              </div>
            ) : (
              <div
                className={`overflow-x-auto rounded-xl border ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                <table className="w-full text-left text-sm">
                  <thead className="bg-blue-600 text-white font-semibold">
                    <tr>
                      <th
                        className="p-3 cursor-pointer select-none hover:bg-blue-700 transition-colors"
                        onClick={() => handleSort("grade")}
                        title="คลิกเพื่อเรียงตาม Grade"
                      >
                        <span className="flex items-center gap-1">
                          GRADE {renderSortIcon("grade")}
                        </span>
                      </th>
                      <th className="p-3">GRADE TYPE</th>
                      <th
                        className="p-3 cursor-pointer select-none hover:bg-blue-700 transition-colors"
                        onClick={() => handleSort("plant")}
                        title="คลิกเพื่อเรียงตาม Plant"
                      >
                        <span className="flex items-center gap-1">
                          PLANT {renderSortIcon("plant")}
                        </span>
                      </th>
                      <th className="p-3">LEVEL</th>
                      <th className="p-3">TIS STATUS</th>
                      <th className="p-3">ACTIVE STATUS</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark
                        ? "divide-slate-700 bg-slate-800"
                        : "divide-slate-100 bg-white"
                    }`}
                  >
                    {filteredGrades.length > 0 ? (
                      filteredGrades.map((item, index) => (
                        <tr
                          key={`${item.Grade}-${item.plant}-${index}`}
                          className={
                            isDark
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-slate-50"
                          }
                        >
                          <td
                            className={`p-3 font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {item.Grade}
                          </td>
                          <td
                            className={
                              isDark ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            {item.Grade_type}
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold">
                              {item.plant}
                            </span>
                          </td>
                          <td
                            className={
                              isDark ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            {item.level}
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                              {item["Status Approved TIS"]}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.is_active === "Active"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {item.is_active}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-slate-400 font-medium"
                        >
                          ไม่พบข้อมูลรายการ Grade ใน Local Storage
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ===== TAB 2: ADMIN CRUD ===== */
          <div
            className={`rounded-2xl p-6 shadow-sm border transition-colors ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-4 mb-4 ${
                isDark ? "border-slate-700" : "border-slate-200"
              }`}
            >
              <div>
                <h2
                  className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                >
                  Grade Management (Admin)
                </h2>
                <p className="text-xs text-slate-400">
                  จัดการ เพิ่ม แก้ไข และยกเลิกการใช้งาน (Soft Delete) Grade
                  ในระบบ
                </p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> + Add Grade
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหา Grade เพื่อจัดการข้อมูล..."
                  className={`w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                />
              </div>
              <div className="relative flex items-center">
                <Filter className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                <select
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className={`pl-9 pr-8 py-2 border rounded-xl text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-200"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <option value="ALL">เลือก Plant (ทั้งหมด)</option>
                  {uniquePlants.map((plant) => (
                    <option key={plant} value={plant}>
                      Plant: {plant}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium">
                  กำลังโหลดข้อมูล Grade ทั้งหมด...
                </p>
              </div>
            ) : (
              <div
                className={`overflow-x-auto rounded-xl border ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                <table className="w-full text-left text-sm border-collapse">
                  <thead
                    className={
                      isDark
                        ? "bg-slate-900 text-white"
                        : "bg-slate-800 text-white"
                    }
                  >
                    <tr>
                      <th
                        className="p-3 cursor-pointer select-none hover:bg-slate-700 transition-colors"
                        onClick={() => handleSort("grade")}
                        title="คลิกเพื่อเรียงตาม Grade"
                      >
                        <span className="flex items-center gap-1">
                          Grade {renderSortIcon("grade")}
                        </span>
                      </th>
                      <th className="p-3">Grade Type</th>
                      <th
                        className="p-3 cursor-pointer select-none hover:bg-slate-700 transition-colors"
                        onClick={() => handleSort("plant")}
                        title="คลิกเพื่อเรียงตาม Plant"
                      >
                        <span className="flex items-center gap-1">
                          Plant {renderSortIcon("plant")}
                        </span>
                      </th>
                      <th className="p-3">Level</th>
                      <th className="p-3">TIS Status</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark
                        ? "divide-slate-700 bg-slate-800"
                        : "divide-slate-200 bg-white"
                    }`}
                  >
                    {filteredGrades.length > 0 ? (
                      filteredGrades.map((item, index) => (
                        <tr
                          key={`${item.Grade}-${item.plant}-${index}`}
                          className={`${
                            isDark
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-slate-50"
                          } ${item.is_active === "Inactive" ? "opacity-50" : ""}`}
                        >
                          <td
                            className={`p-3 font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {item.Grade}
                          </td>
                          <td
                            className={
                              isDark ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            {item.Grade_type}
                          </td>
                          <td
                            className={
                              isDark ? "text-slate-300" : "text-slate-700"
                            }
                          >
                            {item.plant}
                          </td>
                          <td
                            className={
                              isDark ? "text-slate-300" : "text-slate-600"
                            }
                          >
                            {item.level}
                          </td>
                          <td className="p-3 font-medium">
                            {item["Status Approved TIS"]}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.is_active === "Active"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {item.is_active}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => handleOpenEdit(item, e)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20"
                                title="Edit Grade"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleSoftDelete(item, e)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
                                title="Set Inactive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-slate-400 font-medium"
                        >
                          ไม่พบข้อมูลรายการ Grade ใน Local Storage
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${
              isDark
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark
                  ? "bg-slate-900 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <h3
                className={`font-bold text-base ${isDark ? "text-slate-100" : "text-slate-900"}`}
              >
                {isEditMode
                  ? `แก้ไขรายการ Grade: ${formData.Grade}`
                  : "เพิ่มรายการ Grade ใหม่"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">
                  Grade Name
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditMode}
                  value={formData.Grade}
                  onChange={(e) =>
                    setFormData({ ...formData, Grade: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100"
                      : "bg-white border-slate-200 text-slate-800"
                  } ${isEditMode ? "opacity-60 cursor-not-allowed" : ""}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">
                    Grade Type
                  </label>
                  <input
                    type="text"
                    value={formData.Grade_type}
                    onChange={(e) =>
                      setFormData({ ...formData, Grade_type: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">
                    Plant
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.plant}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plant: Number(e.target.value),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">
                    Level
                  </label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">
                    TIS Status Approved
                  </label>
                  <input
                    type="text"
                    value={formData["Status Approved TIS"]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        "Status Approved TIS": e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">
                  Active Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all active:scale-95"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
