# 🎫 Event Ticket Booking Platform - Backend REST APIs (GEEK UP Assignment)

Hệ thống Backend RESTful API xử lý Đặt Vé Ca Nhạc (Flash Sale) chịu tải cao, giải quyết bài toán **Chống Overselling (Bán vượt vé)**, **Idempotency (Chống trùng đơn khi click đúp)**, **Phân quyền người dùng (JWT Role-based)** và **Quản trị Dashboard**.

---

## 🛠️ Công Nghệ & Hạ Tầng (Tech Stack)

- **Language & Runtime**: Node.js (v18+) + TypeScript
- **Web Framework**: Express.js
- **Architecture**: Mô hình 3 Lớp chuẩn chỉ (**Controllers ➔ Services ➔ Repositories**)
- **Database**: PostgreSQL (Local / Remote) + Prisma ORM v7
- **Cache & Concurrency**: Redis Cloud (Gói 30MB Free - Idempotency Key 24h TTL)
- **Authentication**: JWT (JSON Web Token) với 3 vai trò: `Customer`, `Operator`, `Admin`
- **Testing**: Jest Unit Tests
- **API Documentation**: Swagger UI (OpenAPI 3.0) tại `/api-docs`

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Dự Án (Local Setup & Run Guide)

Hướng dẫn từng bước chi tiết dành cho kỹ sư phát triển thiết lập môi trường và khởi chạy dự án trên máy cục bộ (Local Machine).

### 1. Yêu Cầu Tiền Đề (Prerequisites)

Trước khi bắt đầu, đảm bảo bạn đã chuẩn bị sẵn:

- **Node.js**: Phiên bản `>= 18.0.0`
- **npm**: Phiên bản `>= 9.0.0`
- **PostgreSQL**: Cơ sở dữ liệu đang hoạt động (Local PostgreSQL Server, pgAdmin 4 hoặc Docker).
- **Redis Cloud Account**: Tài khoản miễn phí tại Redis Cloud ([https://app.redislabs.com](https://app.redislabs.com)).

---

### 2. Các Bước Cài Đặt (Step-by-Step Installation)

#### **Bước 1: Clone Repository & Cài Đặt Dependencies**

Mở cửa sổ Terminal và thực thi các lệnh:

```bash
# Clone dự án về máy cục bộ
git clone https://github.com/BrianNguyen2k5/TicketBooking.git
cd TicketBooking

# Cài đặt tất cả các thư viện phụ thuộc (Dependencies)
npm install
```

#### **Bước 2: Hướng Dẫn Lấy Thông Tin Kết Nối Redis Cloud & Cấu Hình `.env`**

##### 📌 **Cách lấy Thông số Kết nối Redis Cloud (Free 30MB Database)**:

1. Đăng ký / Đăng nhập tài khoản miễn phí tại: **[https://app.redislabs.com](https://app.redislabs.com)**.
2. Tạo một Database mới (Chọn gói **Free 30MB Fixed**).
3. Sau khi Database được khởi tạo thành công, tại màn hình **Configuration**:
   - Sao chép **Public endpoint (Host)** và **Port** (Ví dụ: `redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345`).
   - Kéo xuống mục **Security** ➔ Click nút xem / sao chép **Default user password**.

##### 📌 **Khởi tạo file `.env`**:

Tạo file `.env` từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

Mở file `.env` vừa tạo và dán các thông số Redis Cloud vừa lấy vào:

```env
# 1. Cấu hình Cổng Server
PORT=3000
NODE_ENV=development

# 2. Cấu hình Kết Nối PostgreSQL
DATABASE_URL="postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@<POSTGRES_HOST>:<POSTGRES_PORT>/<DATABASE_NAME>?schema=public"

# 3. Cấu hình Kết Nối Redis Cloud (Dùng REDIS_URL hoặc điền tham số riêng lẻ)
REDIS_HOST="redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com"
REDIS_PORT=12345
REDIS_PASSWORD="your_redis_cloud_password"

# Hoặc dạng URL đầy đủ:
# REDIS_URL="redis://default:your_redis_cloud_password@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345"

# 4. Cấu hình Chuỗi Bí Mật Mã Hóa JWT Token
JWT_SECRET="geekup_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="1d"
```

#### **Bước 3: Khởi Tạo Cơ Sở Dữ Liệu & Nạp Data Mẫu (Database Setup & Seeding)**

1. Đảm bảo rằng Database của bạn (ví dụ tên `ticketbooking`) đã được tạo trong PostgreSQL.
2. Chạy lệnh sinh Prisma Client:
   ```bash
   npx prisma generate
   ```
3. Nạp cấu trúc bảng và dữ liệu khởi tạo (Database Seeding):
   - Mở công cụ quản lý PostgreSQL của bạn (pgAdmin 4, DBeaver, TablePlus, hoặc `psql` CLI) kết nối vào Database vừa tạo.
   - Mở file kịch bản SQL tại đường dẫn: **`./Database/Data.sql`**.
   - Copy toàn bộ nội dung SQL dán vào Query Tool và thực thi (**Execute / F5**).

   _Lưu ý: Mật khẩu mặc định của tất cả các tài khoản test trong file `Data.sql` sau khi seed là: `password123`._

---

### 3. Khởi Chạy Ứng Dụng (Running the Application)

#### **Chạy ở chế độ Phát triển (Development Mode với Auto-Reload)**:

```bash
npm run dev
```

- Server Express chạy tại: `http://localhost:3000`
- Giao diện tài liệu Swagger API Docs tương tác: `http://localhost:3000/api-docs`

#### **Biên dịch & Chạy ở chế độ Sản xuất (Production Mode)**:

```bash
# Biên dịch TypeScript sang JavaScript (thư mục /dist)
npm run build

# Khởi chạy ứng dụng production
npm start
```

---

### 4. 📖 Hướng Dẫn Truy Cập & Sử Dụng Swagger API Docs

Dự án tích hợp sẵn tài liệu giao diện tương tác **Swagger UI (OpenAPI 3.0)** giúp trải nghiệm và test API trực tiếp trên trình duyệt mà không cần cài đặt Postman.

#### 📌 **Bước 1: Truy cập Swagger UI**

Sau khi khởi chạy server (`npm run dev`), mở trình duyệt web bất kỳ và truy cập đường dẫn:
👉 **`http://localhost:3000/api-docs`**

#### 📌 **Bước 2: Xác thực JWT Token trên Swagger UI**

Để thực thi các API yêu cầu đăng nhập (Customer hoặc Admin):

1. Cuộn đến tab **`Auth Flow`** ➔ Chọn API `POST /api/v1/auth/login`.
2. Bấm nút **Try it out** ➔ Nhập email test (`nguyenvana@gmail.com` cho Customer hoặc `admin@geekup.vn` cho Admin) kèm mật khẩu `password123` ➔ Bấm **Execute**.
3. Copy chuỗi `token` nhận được từ phản hồi JSON.
4. Cuộn lên đầu trang Swagger ➔ Click vào nút **Authorize 🔓** (nút màu xanh lá góc trên bên phải).
5. Nhập chuỗi: `Bearer <TOKEN_CỦA_BẠN>` (ví dụ: `Bearer eyJhbGciOi...`) ➔ Bấm **Authorize** ➔ Bấm **Close**.

Bây giờ bạn có thể thử nghiệm bấm **Try it out** và **Execute** trực tiếp tất cả các APIs Đặt vé, Áp mã Voucher và Dashboard Admin!

---

### 5. Kiểm Tra & Thực Thi Kiểm Thử (Verification & Testing)

1. **Kiểm Tra Trạng Thái Hệ Thống (Health Check API)**:
   - Mở trình duyệt hoặc Postman truy cập: `GET http://localhost:3000/health`
   - Phản hồi kỳ vọng: Trả về trạng thái `"status": "UP"` kèm kết nối PostgreSQL thành công.

2. **Khởi Chạy Bộ Kiểm Thử Tự Động (Run Unit Tests)**:

   ```bash
   npm test
   ```

   - Chạy toàn bộ 19/19 Unit Tests kiểm thử logic tính tiền, chống Oversell và ràng buộc thời gian với Jest.

---

## 📐 Quy Tắc Lập Trình & Hướng Dẫn Phát Triển (Coding Guidelines & Conventions)

Tài liệu này định nghĩa các nguyên tắc thiết kế, quy chuẩn đặt tên và quy trình phát triển dành cho các kỹ sư phần mềm khi bảo trì hoặc phát triển tính năng mới trên codebase.

### 1. Nguyên Tắc Phân Tầng & Trách Nhiệm (Architectural Boundaries & Layer Responsibilities)

Hệ thống áp dụng mô hình **3-Layer Architecture (Controller ➔ Service ➔ Repository)** để đảm bảo nguyên lý Tách biệt Trách nhiệm (Single Responsibility Principle):

- **Layer 1: Controllers Layer (`src/controllers/`)**:
  - **Nhiệm vụ**: Tiếp nhận HTTP Request (`req`), bóc tách tham số (Query, Params, Body), gọi phương thức tương ứng từ Service Layer và trả về kết quả qua HTTP Response (`res`).
  - **Quy chuẩn**:
    - Controllers **không** chứa logic tính toán nghiệp vụ (Business Rules).
    - **Không** truy vấn trực tiếp vào Database hay ORM Client.
    - Tất cả response thành công hoặc thất bại phải sử dụng Standard API Response Envelope:

      ```typescript
      // Thành công (HTTP 200 / 201)
      sendSuccess(res, data, message, statusCode);

      // Thất bại (HTTP 400 / 401 / 403 / 500)
      sendError(res, errorMessage, statusCode);
      ```

- **Layer 2: Services Layer (`src/services/`)**:
  - **Nhiệm vụ**: Chứa toàn bộ Business Domain Logic (Kiểm tra ràng buộc thời gian, điều kiện hợp lệ, kiểm tra hạn ngạch, tính toán giá trị dữ liệu).
  - **Quy chuẩn**:
    - Services hoạt động hoàn toàn độc lập với Express.js (Không sử dụng các đối tượng HTTP như `req`, `res`, `next`).
    - Ném lỗi (`throw new Error(...)`) khi vi phạm điều kiện nghiệp vụ để Controller bắt và trả về HTTP status code phù hợp.
    - Mọi thao tác đọc/ghi cơ sở dữ liệu phải thông qua Repository tương ứng.

- **Layer 3: Repositories Layer (`src/repositories/`)**:
  - **Nhiệm vụ**: Đảm nhiệm duy nhất việc giao tiếp với Database qua Prisma Client hoặc Raw SQL Queries.
  - **Quy chuẩn**:
    - Thực thi các thao tác Giao dịch Nguyên tử (Atomic Transactions) hoặc Row-level Locks khi cần đảm bảo tính nhất quán dữ liệu dưới tải cao.
    - **Không** xử lý các logic phản hồi HTTP hay đưa ra các thông báo dành cho giao diện người dùng.

---

### 2. Quy Chuẩn Đặt Tên (Naming Conventions)

- **Thư mục & File**: Dùng `camelCase` đi kèm后缀 chỉ định tầng (ví dụ: `<feature>.controller.ts`, `<feature>.service.ts`, `<feature>.repository.ts`, `<feature>.route.ts`).
- **Class Name**: Dùng `PascalCase` (ví dụ: `BookingController`, `BookingService`, `BookingRepository`).
- **Function & Variable Name**: Dùng `camelCase` mô tả rõ hành động (ví dụ: `reserveTicket`, `applyVoucher`, `findBookingById`).
- **Database Table & Field Name**: Tuân thủ quy định tên bảng và khóa trong `schema.prisma`.

---

### 3. Quy Trình Phát Triển Một API Mới (How to Implement a New API)

Khi xây dựng một API mới, kỹ sư phát triển tuân theo quy trình 6 bước dưới đây:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. Data Schema  │ ──► │ 2. Repository    │ ──► │ 3. Service      │
│    Definition   │     │    Data Access   │     │    Domain Logic │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐              │
│ 6. Swagger API  │ ◄── │ 5. Route & Auth  │ ◄────────────┘
│    Docs Update  │     │    Middleware    │     4. Controller
└─────────────────┘     └──────────────────┘        HTTP Handler
```

1. **Bước 1: Khai báo Cấu trúc Dữ liệu (Schema Definition)**:
   - Định nghĩa Model trong `prisma/schema.prisma` (nếu cần trường/bảng mới).
   - Chạy lệnh cập nhật Prisma Client: `npx prisma generate`.

2. **Bước 2: Phát triển Tầng Tương Tác Database (Repository Layer)**:
   - Khai báo phương thức truy vấn trong `src/repositories/<feature>.repository.ts`.

3. **Bước 3: Phát triển Tầng Logic Nghiệp Vụ (Service Layer)**:
   - Viết phương thức xử lý nghiệp vụ và validate ràng buộc trong `src/services/<feature>.service.ts`.

4. **Bước 4: Phát triển Tầng Phản Hồi HTTP (Controller Layer)**:
   - Viết handler tiếp nhận `req`/`res` trong `src/controllers/<feature>.controller.ts`.

5. **Bước 5: Đăng ký Route & Middleware**:
   - Gắn endpoint vào `src/routes/<feature>.route.ts` cùng các middleware xác thực JWT (`authenticate`) và phân quyền (`authorizeRole`) nếu có.

6. **Bước 6: Cập nhật Tài liệu OpenAPI (Swagger Docs)**:
   - Khai báo route spec trong `src/config/swagger.ts` dưới nhóm Tag tương ứng.

---

### 4. Quy Chuẩn Viết & Chạy Kiểm Thử Unit Test (How to Write & Run Unit Tests)

- **Vị trí & Cấu trúc**: File test đặt trong thư mục `/tests` với tên dạng `<feature>.service.test.ts`.
- **Phương pháp Cô lập Layer (Layer Isolation)**:
  - Sử dụng `ts-jest` để Mock toàn bộ Repositories Layer (`jest.mock("../src/repositories/<feature>.repository")`).
  - Áp dụng mô hình **AAA (Arrange - Act - Assert)** để kiểm thử thuần túy logic nghiệp vụ của Service Layer mà không bị phụ thuộc vào môi trường Database thực tế.

- **Các lệnh thực thi**:
  - Chạy toàn bộ bộ test suite:
    ```bash
    npm test
    ```
  - Chạy riêng 1 file test bất kỳ:
    ```bash
    npx jest tests/<feature>.service.test.ts
    ```
  - Chạy kiểm thử ở chế độ tự động theo dõi thay đổi (Watch mode):
    ```bash
    npx jest --watch
    ```

---

## 📑 Danh Sách Tài Liệu Dự Án (Project Deliverables)

- 🧪 [TEST_PLAN.md](./Project/TEST_PLAN.md): Kịch bản kiểm thử API từng bước chi tiết trên Postman.
- 🗺️ [FLOW.md](./Project/API_FLOW_LIST.md): Ánh xạ đầy đủ các yêu cầu đề bài sang API Endpoints.
