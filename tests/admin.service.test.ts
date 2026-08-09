import { adminService } from "../src/services/admin.service";
import { adminRepository } from "../src/repositories/admin.repository";

// Giả lập (Mock) các thao tác Repository và kết nối Prisma DB
jest.mock("../src/repositories/admin.repository");
jest.mock("../src/config/db", () => ({
  prisma: {
    concerts: {
      findUnique: jest.fn(),
    },
  },
}));

describe("AdminService Unit Tests - Kiểm Thử Dịch Vụ Quản Trị Admin", () => {
  afterEach(() => {
    // Làm sạch dữ liệu Mock sau mỗi bài test
    jest.clearAllMocks();
  });

  describe("createConcert - Tạo mới Concert & Các Hạng Vé", () => {
    // Test Case 1: Báo lỗi khi thiếu các thông tin bắt buộc của Concert
    it("nên throw error nếu thiếu thông tin concertname, starttime, hoặc startdate", async () => {
      await expect(
        adminService.createConcert({
          concertname: "",
          starttime: "2026-12-01T19:00:00Z",
          startdate: "2026-12-01T00:00:00Z",
          tickets: [],
        })
      ).rejects.toThrow("concertname, starttime, and startdate are required to create a concert");
    });

    // Test Case 2: Báo lỗi khi ngày bắt đầu Concert lại xảy ra sau giờ diễn
    it("nên throw error nếu ngày bắt đầu startdate lớn hơn thời gian diễn starttime", async () => {
      await expect(
        adminService.createConcert({
          concertname: "Born Pink 2026",
          startdate: "2026-12-02T00:00:00Z", // Ngày 2/12
          starttime: "2026-12-01T19:00:00Z", // Giờ diễn 1/12 (Vô lý)
          tickets: [
            {
              ticketname: "VIP",
              priceperticket: 1000000,
              totalquantity: 100,
            },
          ],
        })
      ).rejects.toThrow("Concert startdate cannot be after starttime");
    });

    // Test Case 3: Báo lỗi khi mảng tickets chứa các Hạng vé trùng tên nhau trong cùng 1 Concert
    it("nên throw error nếu truyền mảng vé có các Hạng vé trùng tên trong cùng 1 Concert", async () => {
      await expect(
        adminService.createConcert({
          concertname: "Born Pink 2026",
          startdate: "2026-12-01T00:00:00Z",
          starttime: "2026-12-01T19:00:00Z",
          tickets: [
            {
              ticketname: "VIP Standing",
              priceperticket: 5000000,
              totalquantity: 100,
            },
            {
              ticketname: "VIP Standing", // Trùng tên hạng vé 1
              priceperticket: 4000000,
              totalquantity: 200,
            },
          ],
        })
      ).rejects.toThrow("Duplicate ticket category name 'VIP Standing' inside the same concert");
    });

    // Test Case 4: Ràng buộc thời gian - Bán vé phải kết thúc trước hoặc bằng ngày diễn ra Concert
    it("nên throw error nếu thời gian bán vé diễn ra sau ngày bắt đầu của Concert", async () => {
      await expect(
        adminService.createConcert({
          concertname: "Born Pink 2026",
          startdate: "2026-12-01T00:00:00Z", // Concert diễn ra ngày 1/12
          starttime: "2026-12-01T19:00:00Z",
          tickets: [
            {
              ticketname: "VIP Standing",
              priceperticket: 5000000,
              totalquantity: 100,
              startdatetime: "2026-12-02T00:00:00Z", // Bán vé ngày 2/12 (Sau ngày concert - Vô lý)
              enddatetime: "2026-12-03T00:00:00Z",
            },
          ],
        })
      ).rejects.toThrow("Ticket 'VIP Standing' sale dates (startdatetime & enddatetime) must be before or equal to concert startdate");
    });

    // Test Case 5: Tạo Concert và danh sách vé hợp lệ thành công
    it("nên tạo Concert thành công khi dữ liệu đầu vào chuẩn xác", async () => {
      const mockCreatedConcert = {
        concertid: "conc-004",
        concertname: "Born Pink 2026",
        Tickets: [
          { ticketid: "tkt-007", ticketname: "VIP Standing" },
        ],
      };

      (adminRepository.createConcertWithTickets as jest.Mock).mockResolvedValue(mockCreatedConcert);

      const result = await adminService.createConcert({
        concertname: "Born Pink 2026",
        startdate: "2026-12-01T00:00:00Z",
        starttime: "2026-12-01T19:00:00Z",
        tickets: [
          {
            ticketname: "VIP Standing",
            priceperticket: 5000000,
            totalquantity: 100,
            startdatetime: "2026-10-01T00:00:00Z", // Mở bán 1/10
            enddatetime: "2026-11-30T23:59:59Z",   // Đóng bán 30/11 (Hợp lý)
          },
        ],
      });

      expect(result).toEqual(mockCreatedConcert);
      expect(adminRepository.createConcertWithTickets).toHaveBeenCalledTimes(1);
    });
  });

  describe("createVoucher - Tạo mới Mã Giảm Giá", () => {
    // Test Case 6: Báo lỗi nếu phần trăm giảm giá vượt quá 100%
    it("nên throw error nếu discountvalue loại Percentage vượt quá 100%", async () => {
      await expect(
        adminService.createVoucher({
          vouchername: "BADDEAL",
          discounttype: "Percentage",
          discountvalue: 150, // Giảm 150% (Vô lý)
          maxusage: 100,
          startdate: "2026-08-01T00:00:00Z",
          enddate: "2026-12-31T23:59:59Z",
        })
      ).rejects.toThrow("Percentage discountvalue cannot exceed 100%");
    });

    // Test Case 7: Báo lỗi nếu giới hạn lượt dùng cá nhân lại lớn hơn tổng số lượt dùng toàn hệ thống
    it("nên throw error nếu maxusageperuser lớn hơn tổng lượt dùng maxusage", async () => {
      await expect(
        adminService.createVoucher({
          vouchername: "BADDEAL",
          discounttype: "Fixed",
          discountvalue: 100000,
          maxusage: 5, // Tổng 5 lượt
          maxusageperuser: 10, // 1 user được 10 lượt (Vô lý)
          startdate: "2026-08-01T00:00:00Z",
          enddate: "2026-12-31T23:59:59Z",
        })
      ).rejects.toThrow("maxusageperuser cannot be greater than global maxusage");
    });
  });
});
