/**
 * จัดรูปแบบเลข Plant ให้คั่นด้วย comma ทุก 4 หลัก
 *
 * กฎ: เลข Plant มี 4 ตัวเสมอต่อ 1 กลุ่ม
 * - len <= 4  -> แสดงเดิม เช่น "1324" -> "1324"
 * - len > 4   -> คั่นทุก 4 ตัว เช่น "13111312" -> "1311,1312"
 */
export function formatPlant(plant: string | number | null | undefined): string {
  if (plant === null || plant === undefined || plant === "") return "-";
  const str = String(plant).trim();
  if (str === "") return "-";

  // ถ้าความยาว <= 4 ไม่ต้องคั่น
  if (str.length <= 4) return str;

  // แบ่งเป็นกลุ่มละ 4 ตัวอักษร
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += 4) {
    chunks.push(str.slice(i, i + 4));
  }
  return chunks.join(",");
}