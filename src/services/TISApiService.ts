import { TISItem } from "@/types/tis";
import { TISGradeModel } from "@/models/TISGradeModel";

const CACHE_KEY = "tis_grades_data";
const LAST_UPDATED_KEY = "tis_grades_last_updated";

export class TISApiService {
  private static instance: TISApiService;

  // เพิ่ม Singleton getInstance()
  public static getInstance(): TISApiService {
    if (!TISApiService.instance) {
      TISApiService.instance = new TISApiService();
    }
    return TISApiService.instance;
  }

  /**
   * ดึงข้อมูลที่แคชไว้จาก LocalStorage
   */
  static getCachedData(): {
    data: TISGradeModel[];
    lastUpdated: string | null;
  } {
    if (typeof window === "undefined") {
      return { data: [], lastUpdated: null };
    }
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const lastUpdated = localStorage.getItem(LAST_UPDATED_KEY);

      if (!cached) {
        return { data: [], lastUpdated: null };
      }

      const rawList = JSON.parse(cached);
      const listArray: TISItem[] = Array.isArray(rawList) ? rawList : [];
      const modelData = listArray.map((item) =>
        TISGradeModel.fromApiResponse(item),
      );

      return {
        data: modelData,
        lastUpdated: lastUpdated || null,
      };
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      return { data: [], lastUpdated: null };
    }
  }

  /**
   * บันทึกข้อมูลลง LocalStorage
   */
  static setCachedData(data: TISGradeModel[]): string {
    const now = new Date().toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    try {
      const rawData = data.map((model) => model.toJSON());
      localStorage.setItem(CACHE_KEY, JSON.stringify(rawData));
      localStorage.setItem(LAST_UPDATED_KEY, now);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
    return now;
  }

  /**
   * ยิง API ดึงข้อมูลสดจาก GAS
   */
  static async fetchFromApi(): Promise<TISGradeModel[]> {
    const apiUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_GAS_API_URL is not set");
    }

    const res = await fetch(apiUrl, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch data from GAS API");
    }

    const json = await res.json();

    let rawItems: TISItem[] = [];
    if (Array.isArray(json)) {
      rawItems = json;
    } else if (Array.isArray(json.data)) {
      rawItems = json.data;
    } else if (json.data && typeof json.data === "object") {
      rawItems = Object.values(json.data).flat() as TISItem[];
    }

    return rawItems.map((item) => TISGradeModel.fromApiResponse(item));
  }

  /**
   * สร้าง Grade ใหม่ไปยัง GAS API
   */
  async createGrade(payload: any): Promise<boolean> {
    const apiUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
    if (!apiUrl) throw new Error("NEXT_PUBLIC_GAS_API_URL is not set");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...payload }),
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to create grade:", error);
      return false;
    }
  }

  /**
   * ลบ Grade ใน GAS API
   */
  async deleteGrade(gradeKey: string): Promise<boolean> {
    const apiUrl = process.env.NEXT_PUBLIC_GAS_API_URL;
    if (!apiUrl) throw new Error("NEXT_PUBLIC_GAS_API_URL is not set");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", grade: gradeKey }),
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to delete grade:", error);
      return false;
    }
  }
}
