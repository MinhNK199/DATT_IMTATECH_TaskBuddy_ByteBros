# TaskBuddy Backend API

Backend API cho hệ thống quản lý công việc cá nhân TaskBuddy với AI suggestions và báo cáo chi tiết.

## 🚀 Tính năng

- **Authentication System**: Đăng ký, đăng nhập, đăng xuất với Firebase Auth
- **Task Management**: CRUD operations cho tasks với categories, priorities, tags
- **AI Suggestions**: Gợi ý thông minh dựa trên context và user preferences
- **Reports**: Tạo báo cáo chi tiết với export PDF
- **User Management**: Quản lý profile và preferences
- **Security**: JWT authentication, input validation, rate limiting

## 🛠️ Công nghệ

- **Node.js** & **Express.js** - Backend framework
- **MongoDB** & **Mongoose** - Database
- **Firebase Admin SDK** - Authentication
- **JWT** - Token-based authentication
- **Joi** - Input validation
- **PDFKit** - PDF generation
- **CORS** - Cross-origin resource sharing

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Firebase project với Authentication enabled

## ⚙️ Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment variables
Tạo file `.env` trong thư mục `backend`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/taskbuddy

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Optional: AI Service Configuration
OPENAI_API_KEY=your-openai-api-key
```

### 4. Cấu hình Firebase
1. Tạo project trên [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication với Email/Password và Google providers
3. Tạo Service Account và download JSON file
4. Copy thông tin từ JSON file vào `.env`

### 5. Khởi chạy server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔐 Authentication System

### Đăng ký tài khoản
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "Test User"
}
```

### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Đăng nhập với Google
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "google-id-token-from-client"
}
```

### Kiểm tra trạng thái đăng nhập
```http
GET /api/auth/check
Authorization: Bearer <jwt-token>
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token-here"
}
```

### Đăng xuất
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập với email/password
- `POST /api/auth/google` - Đăng nhập với Google
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Đăng xuất

### Tasks
- `GET /api/tasks` - Lấy danh sách tasks (với pagination và filters)
- `GET /api/tasks/:id` - Lấy task theo ID
- `POST /api/tasks` - Tạo task mới (validate: `validateTask.create`)
  - Body ví dụ:
    ```json
    {
      "title": "Hoàn thành báo cáo dự án",
      "description": "Viết báo cáo tổng kết dự án TaskBuddy",
      "priority": "high",
      "dueDate": "2024-01-15T23:59:59.000Z",
      "category": "Công việc",
      "tags": ["báo cáo", "dự án", "tổng kết"]
    }
    ```
- `PUT /api/tasks/:id` - Cập nhật task (validate: `validateTask.update`)
  - Body ví dụ:
    ```json
    {
      "title": "Hoàn thành báo cáo dự án (Cập nhật)",
      "status": "in_progress",
      "priority": "medium"
    }
    ```
- `DELETE /api/tasks/:id` - Xóa task
- `GET /api/tasks/category/:category` - Lấy tasks theo category
- `GET /api/tasks/priority/:priority` - Lấy tasks theo priority
- `GET /api/tasks/status/:status` - Lấy tasks theo status
- `GET /api/tasks/search/:query` - Tìm kiếm tasks

### AI Suggestions
- `POST /api/ai/suggestions` - Lấy gợi ý AI
- `POST /api/ai/recommendations` - Lấy recommendations cho tasks
- `POST /api/ai/insights` - Lấy insights về productivity

### Reports
- `POST /api/reports` - Tạo báo cáo mới (validate: `validateReport.generate`)
  - Body ví dụ:
    ```json
    {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "type": "monthly",
      "categories": ["Công việc", "Cá nhân"]
    }
    ```
- `GET /api/reports` - Lấy danh sách reports
- `GET /api/reports/:id` - Lấy report theo ID
- `DELETE /api/reports/:id` - Xóa report
- `GET /api/reports/:id/download` - Download report PDF

### Users
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/statistics` - Lấy thống kê user
- `DELETE /api/users/account` - Xóa tài khoản

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication với expiration
- **Input Validation**: Validate tất cả input với Joi schemas
- **Rate Limiting**: Giới hạn số request để tránh abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Firebase Auth**: Integration với Firebase Authentication

## 📊 Database Schema

### User Model
```javascript
{
  uid: String,           // Firebase UID
  email: String,         // Email address
  displayName: String,   // Display name
  photoURL: String,      // Profile photo URL
  provider: String,      // Auth provider (email, google)
  preferences: Object,   // User preferences
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  userId: ObjectId,      // Reference to User
  title: String,         // Task title
  description: String,   // Task description
  priority: String,      // low, medium, high
  status: String,        // pending, in_progress, completed, cancelled
  category: String,      // Task category
  tags: [String],        // Task tags
  dueDate: Date,         // Due date
  completedAt: Date,     // Completion date
  createdAt: Date,
  updatedAt: Date
}
```

### Report Model
```javascript
{
  userId: ObjectId,      // Reference to User
  type: String,          // daily, weekly, monthly, custom
  startDate: Date,       // Report start date
  endDate: Date,         // Report end date
  data: Object,          // Report data
  pdfUrl: String,        // PDF file URL
  createdAt: Date
}
```

## 🧪 Testing

### Sử dụng Postman Collection
1. Import file `TaskBuddy_API.postman_collection.json` vào Postman
2. Set environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: JWT token sau khi đăng nhập
   - `taskId`: ID của task để test
   - `reportId`: ID của report để test

### Test Flow
1. **Register** → Lấy JWT token
2. **Login** → Lấy JWT token
3. **Create Task** → Lấy task ID
4. **Update Task** → Sử dụng task ID
5. **Generate Report** → Lấy report ID
6. **Download Report** → Sử dụng report ID

## 🚀 Deployment

### Environment Variables cho Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-mongodb-uri
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
JWT_SECRET=your-production-jwt-secret
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start src/app.js --name taskbuddy-api
pm2 save
pm2 startup
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    "Detailed error messages"
  ]
}
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Team

**ByteBros Team** - TaskBuddy Development Team

---

**Lưu ý**: Đảm bảo cấu hình Firebase và MongoDB đúng cách trước khi chạy ứng dụng. Tất cả endpoints (trừ `/api/health`) đều yêu cầu authentication.

# QuanLyLopHoc_NodeJS

- Thêm file .env trước khi chạy code:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/quanlylophoc
JWT_SECRET=mySecretKey



- thêm file .babelrc trước khi chạy code (nếu chưa có):
{
    "presets": ["@babel/preset-env"]
}   