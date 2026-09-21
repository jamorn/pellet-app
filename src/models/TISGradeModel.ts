import { TISItem } from "@/types/tis";

export class TISGradeModel implements TISItem {
  Grade: string;
  "Status Approved TIS": string;
  level: string;
  plant: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: string;
  Grade_type: string;

  constructor(item: TISItem) {
    this.Grade = item.Grade;
    this["Status Approved TIS"] = item["Status Approved TIS"];
    this.level = item.level;
    this.plant = item.plant;
    this.created_at = item.created_at;
    this.updated_at = item.updated_at;
    this.created_by = item.created_by;
    this.updated_by = item.updated_by;
    this.is_active = item.is_active;
    this.Grade_type = item.Grade_type;
  }

  // Domain Helper Methods
  public isApproved(): boolean {
    return this["Status Approved TIS"] === "OK";
  }

  public isActiveStatus(): boolean {
    return this.is_active === "Active";
  }

  public toJSON(): TISItem {
    return {
      Grade: this.Grade,
      "Status Approved TIS": this["Status Approved TIS"],
      level: this.level,
      plant: this.plant,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      is_active: this.is_active,
      Grade_type: this.Grade_type,
    };
  }
}
