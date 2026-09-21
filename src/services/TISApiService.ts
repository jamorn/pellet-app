import { GASApiResponse, TISItem } from "@/types/tis";
import { TISGradeModel } from "@/models/TISGradeModel";

export class TISApiService {
  private static instance: TISApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_GAS_API_URL || "";
    if (!this.baseUrl) {
      console.warn(
        "NEXT_PUBLIC_GAS_API_URL is not set in environment variables.",
      );
    }
  }

  // Singleton Pattern Instance Accessor
  public static getInstance(): TISApiService {
    if (!TISApiService.instance) {
      TISApiService.instance = new TISApiService();
    }
    return TISApiService.instance;
  }

  // Fetch all data and parse into Domain Models
  public async fetchAllData(): Promise<{
    responseMeta: Omit<GASApiResponse, "data">;
    items: TISGradeModel[];
  }> {
    const res = await fetch(this.baseUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch GAS API: ${res.statusText}`);
    }
    const json: GASApiResponse = await res.json();

    const items: TISGradeModel[] = [];
    Object.values(json.data).forEach((plantGroup) => {
      plantGroup.forEach((item) => {
        items.push(new TISGradeModel(item));
      });
    });

    return {
      responseMeta: {
        sheet_name: json.sheet_name,
        email: json.email,
        time: json.time,
      },
      items,
    };
  }

  // CRUD Actions to GAS Backend
  public async createGrade(
    data: Omit<TISItem, "created_at" | "updated_at">,
  ): Promise<boolean> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CREATE", payload: data }),
    });
    return res.ok;
  }

  public async updateGrade(
    gradeKey: string,
    data: Partial<TISItem>,
  ): Promise<boolean> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE", gradeKey, payload: data }),
    });
    return res.ok;
  }

  public async deleteGrade(gradeKey: string): Promise<boolean> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE", gradeKey }),
    });
    return res.ok;
  }
}
