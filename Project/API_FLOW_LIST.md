### 🗺️ Exact Endpoint Mapping Table (API Checklist)

Here is how your list maps into clean, RESTful API endpoints:

#### 👤 Customer Flow

| Action in your list                 | Recommended Method & Path                 | Auth Needed? | Key Tech Highlights                           |
| :---------------------------------- | :---------------------------------------- | :----------- | :-------------------------------------------- |
| **Login**                           | `POST /api/v1/auth/login`                 | ❌ Public    | Returns JWT token with Role                   |
| **Browse concerts**                 | `GET /api/v1/browse`                      | ❌ Public    | List all available concerts                   |
| **View ticket categories & prices** | `GET /api/v1/browse/:concertId`           | ❌ Public    | Returns available ticket quantities           |
| **Reserve tickets**                 | `POST /api/v1/bookings`                   | ✅ Customer  | **Idempotency-Key**, Atomic DB update         |
| **Apply voucher**                   | `POST /api/v1/bookings/:id/apply-voucher` | ✅ Customer  | Validates `maxusage` & `maxusageperuser`      |
| **Payment (Mock callback)**         | `POST /api/v1/bookings/:id/pay`           | ✅ Customer  | Changes status `PendingPayment` ➔ `Confirmed` |
| **Track my bookings history**       | `GET /api/v1/bookings/my-bookings`        | ✅ Customer  | Returns list of all user's bookings           |
| **Track specific booking status**   | `GET /api/v1/bookings/:id`                | ✅ Customer  | Returns order details & ticket status         |

---

#### 🛠️ Admin / Operation Dashboard Flow (Role: `Operator` or `Admin`)

| Action in your list                           | Recommended Method & Path                   | Auth Needed? | Purpose                                         |
| :-------------------------------------------- | :------------------------------------------ | :----------- | :---------------------------------------------- |
| **Monitor bookings**                          | `GET /api/v1/admin/bookings`                | ✅ Admin/Op  | List all bookings with status/concert/user filter|
| **Dashboard analytics & stats**               | `GET /api/v1/admin/dashboard/stats`         | ✅ Admin/Op  | Aggregate revenue, tickets sold, status counts  |
| **Create new concert & ticket categories**    | `POST /api/v1/admin/concerts`               | ✅ Admin/Op  | INSERT new concert with ticket categories       |
| **Update concert details & status**           | `PUT /api/v1/admin/concerts/:concertId`     | ✅ Admin/Op  | UPDATE concert details, dates, or status        |
| **Delete / Cancel concert**                   | `DELETE /api/v1/admin/concerts/:concertId`  | ✅ Admin/Op  | DELETE/Cancel concert (soft-delete status)      |
| **Add ticket category to concert**           | `POST /api/v1/admin/concerts/:id/tickets`  | ✅ Admin/Op  | INSERT new ticket category into existing concert|
| **Update ticket category**                    | `PATCH /api/v1/admin/tickets/:ticketId`     | ✅ Admin/Op  | UPDATE price, total quantity, available quantity|
| **Delete / Cancel ticket category**           | `DELETE /api/v1/admin/tickets/:ticketId`    | ✅ Admin/Op  | DELETE/Cancel ticket category                   |
| **Validate ticket availability**              | `GET /api/v1/admin/tickets/availability`    | ✅ Admin/Op  | Real-time count of total vs available tickets   |
| **List all voucher campaigns**                | `GET /api/v1/admin/vouchers`                | ✅ Admin/Op  | READ all discount voucher campaigns             |
| **Create new voucher campaign**               | `POST /api/v1/admin/vouchers`               | ✅ Admin/Op  | INSERT new voucher campaign                     |
| **Update voucher campaign**                   | `PUT /api/v1/admin/vouchers/:voucherId`     | ✅ Admin/Op  | UPDATE voucher discount, dates, usage limits    |
| **Delete / Cancel voucher campaign**          | `DELETE /api/v1/admin/vouchers/:voucherId`  | ✅ Admin/Op  | DELETE/Cancel voucher campaign                  |
| **Handle failed/sus booking & Update status** | `PATCH /api/v1/admin/bookings/:id/status`   | ✅ Admin/Op  | Manual override status (Auto-refunds tickets)   |
