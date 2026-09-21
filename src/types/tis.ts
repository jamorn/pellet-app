export interface TISItem {
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
}

export interface GASApiResponse {
  sheet_name: string;
  email: string;
  time: string;
  data: Record<string, TISItem[]>; // Dictionary key เช่น "1324", "13111312"
}
