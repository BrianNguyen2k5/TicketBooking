import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GeekUp Event Ticket Booking API Documentation",
      version: "1.0.0",
      description:
        "Tài liệu API Hệ thống Đặt Vé Xem Ca Nhạc Flash Sale chịu tải cao. Phân chia rõ ràng giữa các API chính thức theo Đề bài và các API Mở rộng (Extended) hỗ trợ Quản trị Full CRUD.",
      contact: {
        name: "Brian Nguyen",
        url: "https://github.com/BrianNguyen2k5/TicketBooking",
      },
    },
    tags: [
      { name: "Auth Flow", description: "APIs Đăng nhập & Xác thực JWT Token" },
      {
        name: "Customer Flow",
        description: "APIs chính thức cho Khách hàng theo yêu cầu Đề bài",
      },
      {
        name: "Customer Flow (Extended)",
        description:
          "APIs bổ sung hỗ trợ Khách hàng (Xem lịch sử đơn hàng của tôi)",
      },
      {
        name: "Admin Dashboard Flow",
        description:
          "APIs chính thức cho Quản trị viên/Operator theo yêu cầu Đề bài",
      },
      {
        name: "Admin Dashboard Flow (Extended)",
        description:
          "APIs bổ sung mở rộng Quản trị Full CRUD (Concerts, Tickets, Vouchers)",
      },
    ],
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Gắn JWT Token dạng: Bearer <TOKEN>",
        },
        IdempotencyKey: {
          type: "apiKey",
          in: "header",
          name: "Idempotency-Key",
          description: "Chuỗi UUID chống đặt vé trùng khi bấm nhầm nhiều lần",
        },
      },
    },
    paths: {
      // --- 1. AUTH FLOW ---
      "/auth/login": {
        post: {
          summary: "Đăng nhập tài khoản (Customer / Operator / Admin)",
          tags: ["Auth Flow"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "nguyenvana@gmail.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Đăng nhập thành công, trả về JWT Token" },
            401: { description: "Sai email hoặc mật khẩu" },
          },
        },
      },

      // --- 2. CUSTOMER FLOW (CHÍNH THỨC THEO ĐỀ BÀI) ---
      "/browse": {
        get: {
          summary: "Xem danh sách tất cả các Concerts (Browse concerts)",
          tags: ["Customer Flow"],
          responses: {
            200: { description: "Trả về mảng danh sách Concerts" },
          },
        },
      },
      "/browse/{concertId}": {
        get: {
          summary:
            "Xem chi tiết Concert và các hạng vé (View ticket categories & prices)",
          tags: ["Customer Flow"],
          parameters: [
            {
              name: "concertId",
              in: "path",
              required: true,
              schema: { type: "string", example: "conc-001" },
            },
          ],
          responses: {
            200: {
              description: "Thông tin chi tiết Concert kèm danh sách Tickets",
            },
            404: { description: "Không tìm thấy Concert" },
          },
        },
      },
      "/bookings": {
        post: {
          summary:
            "Đặt vé giữ chỗ (Reserve tickets - Atomic SQL & Redis Idempotency)",
          tags: ["Customer Flow"],
          security: [{ BearerAuth: [] }, { IdempotencyKey: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ticketid: { type: "string", example: "tkt-001" },
                    amount: { type: "integer", example: 2 },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Đặt vé giữ chỗ thành công (PendingPayment 10 mins)",
            },
            400: { description: "Hết vé hoặc vé không khả dụng" },
          },
        },
      },
      "/bookings/{bookingId}/apply-voucher": {
        post: {
          summary: "Áp dụng mã giảm giá (Apply voucher)",
          tags: ["Customer Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string", example: "bkg-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    voucherid: { type: "string", example: "vch-001" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Áp dụng voucher thành công, tính lại finalprice",
            },
          },
        },
      },
      "/bookings/{bookingId}/pay": {
        post: {
          summary:
            "Thanh toán giả lập callback (Payment - PendingPayment -> Confirmed)",
          tags: ["Customer Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string", example: "bkg-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    paymentmethod: { type: "string", example: "MOMO" },
                    transactionid: {
                      type: "string",
                      example: "TXN-9988776655",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Thanh toán thành công, đơn hàng Confirmed" },
          },
        },
      },
      "/bookings/{bookingId}": {
        get: {
          summary: "Xem chi tiết 1 đơn hàng (Track booking status)",
          tags: ["Customer Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string", example: "bkg-001" },
            },
          ],
          responses: {
            200: { description: "Thông tin chi tiết đơn hàng" },
          },
        },
      },

      // --- 3. CUSTOMER FLOW (EXTENDED - BỔ SUNG) ---
      "/bookings/my-bookings": {
        get: {
          summary:
            "Xem danh sách tất cả đơn hàng của tôi (My Bookings History)",
          tags: ["Customer Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Danh sách lịch sử đơn hàng của khách hàng" },
          },
        },
      },

      // --- 4. ADMIN DASHBOARD FLOW (CHÍNH THỨC THEO ĐỀ BÀI) ---
      "/admin/bookings": {
        get: {
          summary: "Giám sát toàn bộ đơn hàng (Monitor bookings)",
          tags: ["Admin Dashboard Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "status",
              in: "query",
              schema: { type: "string" },
              description:
                "Lọc theo status (Confirmed, PendingPayment, Cancelled, Expired)",
            },
            { name: "concertid", in: "query", schema: { type: "string" } },
            { name: "userid", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Danh sách đơn hàng toàn hệ thống" },
          },
        },
      },
      "/admin/dashboard/stats": {
        get: {
          summary:
            "Thống kê báo cáo doanh thu & số vé (Dashboard analytics & stats)",
          tags: ["Admin Dashboard Flow"],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Báo cáo tổng quan doanh thu và số vé" },
          },
        },
      },
      "/admin/concerts": {
        post: {
          summary:
            "Tạo Concert mới kèm các Hạng vé (Create new concert & ticket categories)",
          tags: ["Admin Dashboard Flow"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    concertname: {
                      type: "string",
                      example: "Born Pink Hanoi 2026",
                    },
                    starttime: {
                      type: "string",
                      example: "2026-12-01T19:00:00Z",
                    },
                    startdate: {
                      type: "string",
                      example: "2026-12-01T00:00:00Z",
                    },
                    tickets: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          ticketname: {
                            type: "string",
                            example: "VIP Standing",
                          },
                          priceperticket: { type: "number", example: 6500000 },
                          totalquantity: { type: "integer", example: 1000 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Tạo Concert và Hạng vé thành công" },
          },
        },
      },
      "/admin/tickets/availability": {
        get: {
          summary:
            "Kiểm tra tình trạng kho vé Real-time (Validate ticket availability)",
          tags: ["Admin Dashboard Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "ticketid",
              in: "query",
              schema: { type: "string" },
              description: "Mã vé cụ thể nếu muốn validate 1 vé",
            },
          ],
          responses: {
            200: { description: "Chi tiết số lượng vé khả dụng" },
          },
        },
      },
      "/admin/vouchers": {
        post: {
          summary: "Tạo chiến dịch mã giảm giá (Create new voucher campaign)",
          tags: ["Admin Dashboard Flow"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    vouchername: { type: "string", example: "SUPERDEAL2026" },
                    description: {
                      type: "string",
                      example: "Giảm 20% cho đơn hàng",
                    },
                    discounttype: { type: "string", example: "Percentage" },
                    discountvalue: { type: "number", example: 20 },
                    maxusage: { type: "integer", example: 500 },
                    maxusageperuser: { type: "integer", example: 1 },
                    startdate: {
                      type: "string",
                      example: "2026-08-01T00:00:00Z",
                    },
                    enddate: {
                      type: "string",
                      example: "2026-12-31T23:59:59Z",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Tạo Voucher thành công" },
          },
        },
        get: {
          summary:
            "Xem danh sách tất cả các chiến dịch Voucher (List all voucher campaigns)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Danh sách toàn bộ Vouchers" },
          },
        },
      },
      "/admin/bookings/{bookingId}/status": {
        patch: {
          summary:
            "Can thiệp đổi trạng thái đơn thủ công & Hủy đơn lỗi/gian lận (Handle failed/sus bookings & Manual override)",
          tags: ["Admin Dashboard Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string", example: "bkg-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "Cancelled" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                "Cập nhật trạng thái thành công (Tự động cộng trả vé vào kho)",
            },
          },
        },
      },

      // --- 5. ADMIN DASHBOARD FLOW (EXTENDED - MỞ RỘNG FULL CRUD) ---
      "/admin/concerts/{concertId}": {
        put: {
          summary: "Cập nhật thông tin Concert (Update concert details)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "concertId",
              in: "path",
              required: true,
              schema: { type: "string", example: "conc-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    concertname: {
                      type: "string",
                      example: "Anh Trai Say Hi Live Concert 2026 (Updated)",
                    },
                    status: { type: "string", example: "OnSale" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Cập nhật Concert thành công" },
          },
        },
        delete: {
          summary: "Hủy / Vô hiệu hóa Concert (Delete / Cancel concert)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "concertId",
              in: "path",
              required: true,
              schema: { type: "string", example: "conc-001" },
            },
          ],
          responses: {
            200: { description: "Hủy Concert thành công" },
          },
        },
      },
      "/admin/concerts/{concertId}/tickets": {
        post: {
          summary:
            "Thêm Hạng vé mới vào Concert có sẵn (Add ticket category to concert)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "concertId",
              in: "path",
              required: true,
              schema: { type: "string", example: "conc-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ticketname: {
                      type: "string",
                      example: "President Box Package",
                    },
                    priceperticket: { type: "number", example: 10000000 },
                    totalquantity: { type: "integer", example: 50 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Tạo Hạng vé mới thành công" },
          },
        },
      },
      "/admin/tickets/{ticketId}": {
        patch: {
          summary: "Cập nhật thông tin Hạng vé (Update ticket category)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "ticketId",
              in: "path",
              required: true,
              schema: { type: "string", example: "tkt-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    priceperticket: { type: "number", example: 3800000 },
                    status: { type: "string", example: "Available" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Cập nhật Hạng vé thành công" },
          },
        },
        delete: {
          summary:
            "Hủy / Vô hiệu hóa Hạng vé (Delete / Cancel ticket category)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "ticketId",
              in: "path",
              required: true,
              schema: { type: "string", example: "tkt-001" },
            },
          ],
          responses: {
            200: { description: "Hủy Hạng vé thành công" },
          },
        },
      },
      "/admin/vouchers/{voucherId}": {
        put: {
          summary: "Cập nhật thông tin Voucher (Update voucher campaign)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "voucherId",
              in: "path",
              required: true,
              schema: { type: "string", example: "vch-001" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    discountvalue: { type: "number", example: 300000 },
                    maxusage: { type: "integer", example: 1000 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Cập nhật Voucher thành công" },
          },
        },
        delete: {
          summary:
            "Hủy / Vô hiệu hóa Voucher (Delete / Cancel voucher campaign)",
          tags: ["Admin Dashboard Flow (Extended)"],
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: "voucherId",
              in: "path",
              required: true,
              schema: { type: "string", example: "vch-001" },
            },
          ],
          responses: {
            200: { description: "Hủy Voucher thành công" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
