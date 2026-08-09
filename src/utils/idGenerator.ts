import { prisma } from "../config/db";

// Bảng ánh xạ tiền tố BẮT BUỘC cho từng bảng dữ liệu (Khớp chính xác với Data.sql)
const PREFIX_MAP: Record<string, string> = {
  Bookings: "bkg-",
  Concerts: "conc-",
  Tickets: "tkt-",
  Users: "usr-",
  Voucher: "vch-",
};

/**
 * Hàm sinh nhiều ID liên tiếp (Batch ID generation) để dùng trong vòng lặp Transaction.
 * Giúp tránh trùng lặp Unique Constraint khi insert nhiều dòng cùng lúc.
 */
export const generateNextIds = async (
  tableName: "Bookings" | "Users" | "Concerts" | "Tickets" | "Voucher",
  idColumn: string,
  count: number = 1
): Promise<string[]> => {
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

  let currentNum = 0;
  let padLength = 3;

  if (result && result.length > 0 && result[0][idColumn]) {
    const maxId: string = String(result[0][idColumn]);
    const matches = maxId.match(/\d+$/);
    if (matches) {
      const numStr = matches[0];
      currentNum = parseInt(numStr, 10);
      padLength = Math.max(3, numStr.length);
    }
  }

  const generatedIds: string[] = [];
  for (let i = 1; i <= count; i++) {
    const nextNum = currentNum + i;
    const formattedNum = String(nextNum).padStart(padLength, "0");
    generatedIds.push(`${prefix}${formattedNum}`);
  }

  return generatedIds;
};

/**
 * Hàm tự động sinh 1 ID tiếp theo.
 */
export const generateNextId = async (
  tableName: "Bookings" | "Users" | "Concerts" | "Tickets" | "Voucher",
  idColumn: string,
): Promise<string> => {
  const ids = await generateNextIds(tableName, idColumn, 1);
  return ids[0];
};
