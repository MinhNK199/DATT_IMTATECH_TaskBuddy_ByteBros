# DATT_IMTATECH_TaskBuddy_ByteBros
Dự án thực tập của nhóm ByteBros tại công ty IMTATECH Kỳ SU25
# Hệ thống Quản lý Công việc Cá nhân TaskBuddy

## Mô tả đề tài
TaskBuddy là một ứng dụng web giúp người dùng quản lý công việc cá nhân hàng ngày, tra cứu nhiệm vụ, tạo báo cáo tiến độ, và hiển thị dashboard trực quan. Ứng dụng tích hợp AI gợi ý lộ trình công việc để hỗ trợ người dùng lập kế hoạch hiệu quả, ưu tiên nhiệm vụ hợp lý, và cải thiện năng suất. Hệ thống hướng đến đối tượng phổ thông như sinh viên, nhân viên văn phòng, hoặc freelancer, với giao diện thân thiện và tính năng dễ sử dụng. React được dùng cho giao diện, Node.js xử lý logic backend, và Firebase đảm bảo lưu trữ dữ liệu và xác thực an toàn.

## Các chức năng chính
- **Quản lý công việc:**
  - Tạo, chỉnh sửa, xóa nhiệm vụ với thông tin: tiêu đề, mô tả, thời hạn, mức độ ưu tiên (thấp, trung bình, cao), danh mục (cá nhân, công việc, học tập).
  - Đánh dấu trạng thái nhiệm vụ (hoàn thành, đang thực hiện, chưa bắt đầu).
  - Kéo-thả sắp xếp nhiệm vụ theo thứ tự ưu tiên.
- **Tra cứu công việc:**
  - Tìm kiếm nhiệm vụ bằng từ khóa, trạng thái, hoặc khoảng thời gian.
  - Lọc nhiệm vụ theo danh mục hoặc mức độ ưu tiên.
- **AI gợi ý lộ trình công việc:**
  - AI phân tích danh sách nhiệm vụ (dựa trên thời hạn, mức độ ưu tiên, danh mục) để gợi ý lộ trình thực hiện tối ưu.
  - Gợi ý thời gian nghỉ ngơi hoặc điều chỉnh lịch trình nếu phát hiện quá tải.
  - Sử dụng thuật toán đơn giản hoặc API AI nhẹ.
- **Báo cáo và Dashboard:**
  - Dashboard trực quan tiến độ: tỷ lệ nhiệm vụ hoàn thành (biểu đồ tròn), số lượng nhiệm vụ theo ngày/tuần (biểu đồ cột).
  - Tạo báo cáo hiệu suất hàng tuần/tháng, xuất file PDF.
  - Gợi ý cải thiện năng suất dựa trên AI.
- **Xác thực và đồng bộ:**
  - Đăng nhập/đăng ký qua email hoặc Google bằng Firebase Authentication.
  - Lưu trữ công việc cá nhân trên Firebase Firestore, đồng bộ thời gian thực.

## Công nghệ sử dụng
- **Frontend:** ReactJS, Tailwind CSS, React Beautiful DnD
- **Backend:** Node.js, Express
- **Cơ sở dữ liệu:** Firebase Firestore
- **Xác thực:** Firebase Authentication
- **AI gợi ý:** Thuật toán quy tắc hoặc API AI nhẹ
- **Dashboard:** Chart.js

## Cài đặt và Chạy Backend

### Yêu cầu hệ thống
- Node.js (v16 trở lên)
- MongoDB
- Firebase project

### Cài đặt dependencies
```bash
cd backend
npm install
```

### Cấu hình môi trường
Tạo file `.env` trong thư mục `backend`:
```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/taskbuddy

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Chạy server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Tất cả API endpoints (trừ đăng nhập) đều yêu cầu Bearer Token từ Firebase Authentication.

**Header:**
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### Tasks API (`/tasks`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/tasks` | Tạo task mới |
| GET | `/tasks` | Lấy danh sách task (có filter) |
| GET | `/tasks/:id` | Lấy chi tiết task |
| PUT | `/tasks/:id` | Cập nhật task |
| DELETE | `/tasks/:id` | Xóa task |
| PATCH | `/tasks/:id/status` | Cập nhật trạng thái task |
| GET | `/tasks/stats` | Lấy thống kê task |
| GET | `/tasks/overdue` | Lấy task quá hạn |

#### AI API (`/ai`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/ai/schedule` | Tạo lộ trình AI |
| GET | `/ai/insights` | Lấy insights năng suất |
| GET | `/ai/suggestions` | Lấy gợi ý tối ưu hóa |
| GET | `/ai/workload` | Phân tích workload |
| GET | `/ai/recommendations` | Gợi ý cải thiện năng suất |

#### Reports API (`/reports`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/reports` | Tạo báo cáo mới |
| GET | `/reports` | Lấy danh sách báo cáo |
| GET | `/reports/dashboard` | Lấy dữ liệu dashboard |
| GET | `/reports/quick` | Tạo báo cáo nhanh |
| GET | `/reports/:id` | Lấy chi tiết báo cáo |
| GET | `/reports/:id/pdf` | Xuất PDF báo cáo |

#### Users API (`/users`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/users/profile` | Lấy profile user |
| POST | `/users/profile` | Tạo/cập nhật profile |
| PATCH | `/users/profile` | Cập nhật thông tin user |
| GET | `/users/preferences` | Lấy preferences |
| PATCH | `/users/preferences` | Cập nhật preferences |

## Sử dụng Postman Collection

### Import Collection
1. Mở Postman
2. Click "Import" → "File" → Chọn file `backend/TaskBuddy_API.postman_collection.json`

### Cấu hình Variables
1. Tạo Environment mới trong Postman
2. Thêm các variables:
   - `base_url`: `http://localhost:3000`
   - `token`: Firebase ID token (lấy từ frontend sau khi đăng nhập)
   - `taskId`: ID của task (tự động điền sau khi tạo task)
   - `reportId`: ID của report (tự động điền sau khi tạo report)

### Lấy Firebase Token
```javascript
// Trong frontend React
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const token = await auth.currentUser?.getIdToken();
console.log('Firebase Token:', token);
```

### Test API
1. **Tạo task mới:**
   - Method: POST
   - URL: `{{base_url}}/tasks`
   - Body:
   ```json
   {
     "title": "Học React",
     "description": "Xem tài liệu ReactJS",
     "category": "study",
     "priority": "high",
     "dueDate": "2024-07-01T23:59:59.000Z"
   }
   ```

2. **Lấy danh sách task:**
   - Method: GET
   - URL: `{{base_url}}/tasks?status=in_progress`

3. **Tạo lộ trình AI:**
   - Method: GET
   - URL: `{{base_url}}/ai/schedule`

## Cấu trúc Database

### Collections

#### Users
```javascript
{
  uid: String,           // Firebase UID
  email: String,         // Email
  displayName: String,   // Tên hiển thị
  photoURL: String,      // URL avatar
  provider: String,      // 'email' | 'google'
  preferences: {
    theme: 'light' | 'dark',
    notifications: Boolean,
    aiSuggestions: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks
```javascript
{
  userId: String,        // Firebase UID
  title: String,         // Tiêu đề task
  description: String,   // Mô tả
  category: 'personal' | 'work' | 'study',
  priority: 'low' | 'medium' | 'high',
  status: 'not_started' | 'in_progress' | 'completed',
  dueDate: Date,         // Thời hạn
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  notes: String,
  order: Number,         // Thứ tự sắp xếp
  createdAt: Date,
  updatedAt: Date
}
```

#### Reports
```javascript
{
  userId: String,
  type: 'weekly' | 'monthly' | 'custom',
  period: {
    startDate: Date,
    endDate: Date
  },
  statistics: {
    totalTasks: Number,
    completedTasks: Number,
    completionRate: Number,
    // ... other stats
  },
  categoryBreakdown: Array,
  priorityBreakdown: Array,
  dailyProgress: Array,
  aiInsights: Array,
  recommendations: Array,
  generatedAt: Date
}
```

## Phân công công việc
- **Nguyễn Kim Minh:** Backend (Node.js + Express), tích hợp API với Firebase, xử lý logic AI gợi ý lộ trình.
- **Nguyễn Kim Thông:** Thiết kế giao diện (React + Tailwind CSS), tích hợp kéo-thả.
- **Phạm Thế Hưng:** Xây dựng dashboard, tích hợp biểu đồ (Chart.js).
- **Tuấn Anh:** Kiểm thử hệ thống, triển khai xác thực (Firebase Authentication).

## Kế hoạch thực hiện
- **Tuần 1:** Phân tích yêu cầu, thiết kế giao diện, cấu trúc dữ liệu Firebase.
- **Tuần 2-3:** Xây dựng backend (API Node.js), frontend cơ bản (React, form nhập công việc).
- **Tuần 4:** Tích hợp Firebase (Firestore, Authentication), phát triển AI gợi ý đơn giản.
- **Tuần 5:** Xây dựng dashboard, báo cáo (Chart.js).
- **Tuần 6:** Kiểm thử, sửa lỗi, hoàn thiện ứng dụng.

## Lý do chọn đề tài
- **Dễ tiếp cận:** Quản lý công việc cá nhân là nhu cầu quen thuộc, dễ hiểu.
- **Thực tế đại chúng:** Phù hợp sinh viên, nhân viên, freelancer, nổi bật với AI gợi ý lộ trình.
- **Phù hợp công nghệ:** React, Node.js, Firebase phổ biến, dễ học, hỗ trợ tốt cho web app.
- **Khả thi nhóm 4 người:** Chức năng chia nhỏ, dễ phân công, triển khai trong thời gian ngắn.

## Troubleshooting

### Lỗi thường gặp

1. **Lỗi kết nối MongoDB:**
   - Kiểm tra MongoDB đã chạy chưa
   - Kiểm tra MONGODB_URI trong .env

2. **Lỗi Firebase:**
   - Kiểm tra Firebase credentials trong .env
   - Đảm bảo Firebase project đã được tạo

3. **Lỗi CORS:**
   - Backend đã cấu hình CORS cho frontend
   - Kiểm tra origin trong frontend

4. **Lỗi Authentication:**
   - Đảm bảo token Firebase hợp lệ
   - Kiểm tra token không hết hạn

## Contributing
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## License
ISC License