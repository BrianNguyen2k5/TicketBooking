import { prisma } from "../config/db";

// Bảng ánh xạ tiền tố BẮT BUỘC cho từng bảng dữ liệu
const PREFIX_MAP: Record<string, string> = {
  Bookings: "bk-",
  Concerts: "cnc-",
  Tickets: "tkt-",
  Users: "usr-",
  Voucher: "vch-",
};

/**
 * Hàm tự động sinh ID tiếp theo theo chuẩn 3 chữ số bắt đầu (001, 002,... 999).
 * Nếu vượt quá 999, tự động mở rộng lên 4 chữ số (1000, 1001,...).
 * 
 * Quy tắc:
 * - Bookings ➔ bk-001, bk-002, ..., bk-999, bk-1000
 * - Concerts ➔ cnc-001, cnc-002, ...
 * - Tickets  ➔ tkt-001, tkt-002, ...
 * - Users    ➔ usr-001, usr-002, ...
 * - Voucher  ➔ vch-001, vch-002, ...
 */
export const generateNextId = async (
  tableName: "Bookings" | "Users" | "Concerts" | "Tickets" | "Voucher",
  idColumn: string,
): Promise<string> => {
  const prefix = PREFIX_MAP[tableName] || "id-";

  // Query tìm ID lớn nhất mang tiền tố chuẩn trong DB
  const query = `
    SELECT "${idColumn}" 
    FROM "${tableName}" 
    WHERE "${idColumn}" LIKE $1 
    ORDER BY LENGTH("${idColumn}") DESC, "${idColumn}" DESC 
    LIMIT 1
  `;

  const result: any[] = await prisma.$queryRawUnsafe(query, `${prefix}%`);

  // 1. Nếu chưa có bản ghi nào -> Bắt đầu từ '001'
  if (!result || result.length === 0 || !result[0][idColumn]) {
    return `${prefix}001`;
  }

  const maxId: string = String(result[0][idColumn]);

  // 2. Bóc tách phần số ở cuối ID (Ví dụ từ 'bk-009' bóc ra '009')
  const matches = maxId.match(/\d+$/);

  if (!matches) {
    return `${prefix}001`;
  }

  const numStr = matches[0];
  const currentNum = parseInt(numStr, 10);
  const nextNum = currentNum + 1;

  // Bắt đầu đệm tối thiểu 3 chữ số ('001'), nếu lớn hơn 999 tự động mở rộng lên 4 chữ số ('1000')
  const padLength = Math.max(3, numStr.length);
  const formattedNum = String(nextNum).padStart(padLength, "0");

  return `${prefix}${formattedNum}`;
};
