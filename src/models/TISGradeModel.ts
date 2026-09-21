import { TISItem } from "@/types/tis";

export class TISGradeModel {
  id?: string;
  grade: string;
  gradeType: string;
  plant: string | number;
  level: string;
  tisStatus: string;
  activeStatus: string;

  constructor(data: Partial<TISGradeModel>) {
    this.id = data.id;
    this.grade = data.grade || "";
    this.gradeType = data.gradeType || "N/A";
    this.plant = data.plant || "";
    this.level = data.level || "-";
    this.tisStatus = data.tisStatus || "N/A";
    this.activeStatus = data.activeStatus || "Inactive";
  }

  /**
   * Factory Method สำหรับแปลง Raw Data จาก API/JSON เข้าสู่ Domain Model
   */
  static fromApiResponse(rawItem: TISItem | Record<string, any>): TISGradeModel {
    // Cast เป็น any ชั่วคราวเฉพาะตอนดึง Property เพื่อรองรับความหลากหลายของ Key
    const item = rawItem as any;

    const gradeVal = item.grade || item.Grade || "";
    const plantVal = item.plant || item.Plant || "";

    return new TISGradeModel({
      id: item.id || item.ID || (gradeVal ? `${gradeVal}-${plantVal}` : undefined),
      grade: gradeVal,
      gradeType: item.gradeType || item.grade_type || item.Grade_type || item.GradeType || "N/A",
      plant: plantVal,
      level: item.level || item.Level || "-",
      tisStatus: item.tisStatus || item.tis_status || item.Tis_status || item.TisStatus || "N/A",
      activeStatus: item.activeStatus || item.active_status || item.Active_status || item.ActiveStatus || "Active",
    });
  }

  /**
   * แปลง Domain Model กลับเป็น Plain Object สำหรับเก็บลง LocalStorage
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      grade: this.grade,
      gradeType: this.gradeType,
      plant: this.plant,
      level: this.level,
      tisStatus: this.tisStatus,
      activeStatus: this.activeStatus,
    };
  }
}