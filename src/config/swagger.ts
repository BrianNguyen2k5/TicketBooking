import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GeekUp Event Ticket Booking API Documentation",
      version: "1.0.0",
      description:
        "Tài liệu API Hệ thống Đặt Vé Xem Ca Nhạc Flash Sale chịu tải cao. Hỗ trợ Idempotency, Chống Overselling, Phân quyền JWT Role-based và Quản trị Dashboard.",
      contact: {
        name: "Brian Nguyen",
        url: "https://github.com/BrianNguyen2k5/TicketBooking",
      },
    },
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
      "/auth/login": {
        post: {
          summary: "Đăng nhập tài khoản (Customer / Operator / Admin)",
          tags: ["Auth"],
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
      "/browse": {
        get: {
          summary: "Xem danh sách tất cả các Concerts",
          tags: ["Customer Browse"],
          responses: {
            200: { description: "Trả về mảng danh sách Concerts" },
          },
        },
      },
      "/browse/{concertId}": {
        get: {
          summary: "Xem chi tiết Concert và các hạng vé",
          tags: ["Customer Browse"],
          parameters: [
            {
              name: "concertId",
              in: "path",
              required: true,
              schema: { type: "string", example: "conc-001" },
            },
          ],
          responses: {
            200: { description: "Thông tin chi tiết Concert kèm danh sách Tickets" },
            404: { description: "Không tìm thấy Concert" },
          },
        },
      },
      "/bookings": {
        post: {
          summary: "Đặt vé giữ chỗ (Atomic SQL lock chống Overselling & Redis Idempotency)",
          tags: ["Customer Booking"],
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
            201: { description: "Đặt vé giữ chỗ thành công (PendingPayment 10 mins)" },
            400: { description: "Hết vé hoặc vé không khả dụng" },
          },
        },
      },
      "/bookings/my-bookings": {
        get: {
          summary: "Xem lịch sử đơn hàng của tôi",
          tags: ["Customer Booking"],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Danh sách đơn hàng của khách hàng" },
          },
        },
      },
      "/bookings/{bookingId}": {
        get: {
          summary: "Xem chi tiết 1 đơn hàng (Track Booking Status)",
          tags: ["Customer Booking"],
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
      "/bookings/{bookingId}/apply-voucher": {
        post: {
          summary: "Áp dụng mã giảm giá Voucher",
          tags: ["Customer Booking"],
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
            200: { description: "Áp dụng voucher thành công, tính lại finalprice" },
          },
        },
      },
      "/bookings/{bookingId}/pay": {
        post: {
          summary: "Giả lập thanh toán callback (PendingPayment -> Confirmed)",
          tags: ["Customer Booking"],
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
                    transactionid: { type: "string", example: "TXN-9988776655" },
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
      "/admin/bookings": {
        get: {
          summary: "Giám sát tất cả đơn hàng (Filter status, concertid, userid)",
          tags: ["Admin / Operator Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "concertid", in: "query", schema: { type: "string" } },
            { name: "userid", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Danh sách đơn hàng hệ thống" },
          },
        },
      },
      "/admin/dashboard/stats": {
        get: {
          summary: "Thống kê báo cáo doanh thu & số vé bán ra",
          tags: ["Admin / Operator Flow"],
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Báo cáo tổng quan doanh thu và số vé" },
          },
        },
      },
      "/admin/tickets/availability": {
        get: {
          summary: "Kiểm tra tình trạng kho vé Real-time (Tổng vs Khả dụng)",
          tags: ["Admin / Operator Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "ticketid", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Chi tiết số lượng vé khả dụng" },
          },
        },
      },
      "/admin/concerts": {
        post: {
          summary: "Tạo Concert mới kèm các Hạng vé",
          tags: ["Admin / Operator Flow"],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    concertname: { type: "string", example: "Born Pink Hanoi 2026" },
                    starttime: { type: "string", example: "2026-12-01T19:00:00Z" },
                    startdate: { type: "string", example: "2026-12-01T00:00:00Z" },
                    tickets: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          ticketname: { type: "string", example: "VIP Standing" },
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
      "/admin/bookings/{bookingId}/status": {
        patch: {
          summary: "Can thiệp đổi trạng thái đơn thủ công & Hủy đơn nghi ngờ gian lận (Auto refund vé)",
          tags: ["Admin / Operator Flow"],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "bookingId", in: "path", required: true, schema: { type: "string", example: "bkg-001" } },
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
            200: { description: "Cập nhật trạng thái thành công" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
