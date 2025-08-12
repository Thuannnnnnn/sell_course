# 🎓 Sell Course - Hệ Thống Bán Khóa Học Trực Tuyến

Một nền tảng học tập trực tuyến (LMS - Learning Management System) hoàn chỉnh với khả năng tạo và bán khóa học, quản lý học viên, và tạo bài kiểm tra tự động bằng AI.

## 📋 Tổng Quan Dự Án

Sell Course là một hệ thống bán khóa học trực tuyến đầy đủ tính năng, bao gồm:

- **Frontend cho học viên** - Giao diện học tập và mua khóa học
- **Admin Dashboard** - Quản lý khóa học và người dùng  
- **Backend API** - Xử lý logic nghiệp vụ và dữ liệu
- **AI Quiz Generator** - Tạo bài kiểm tra tự động bằng trí tuệ nhân tạo

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    SELL COURSE PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Port 3000)     │  Admin Dashboard (Port 5000)    │
│  ┌─────────────────────┐  │  ┌─────────────────────────────┐ │
│  │   Next.js 14        │  │  │      Next.js 14             │ │
│  │   - Course Browsing │  │  │   - User Management         │ │
│  │   - Learning        │  │  │   - Course Management       │ │
│  │   - Quiz Taking     │  │  │   - Analytics Dashboard     │ │
│  │   - Profile         │  │  │   - Content Management      │ │
│  └─────────────────────┘  │  └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Backend API (Port 8000)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     NestJS                              │ │
│  │  - Authentication & Authorization                       │ │
│  │  - Course & Lesson Management                           │ │
│  │  - Enrollment & Progress Tracking                       │ │
│  │  │  - Payment Processing (PayOS)                        │ │
│  │  - Quiz & Exam System                                   │ │
│  │  - Support Chat (WebSocket)                             │ │
│  │  - Certificate Generation                               │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│         AI Quiz Generator (Port 8000)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    FastAPI                              │ │
│  │  - Google Gemini Integration                            │ │
│  │  - DOCX/JSON File Processing                            │ │
│  │  - Automatic Quiz Generation                            │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Database Layer                         │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   PostgreSQL    │    │      Redis      │                │
│  │   - Main Data   │    │   - Cache       │                │
│  │   - TypeORM     │    │   - Sessions    │                │
│  └─────────────────┘    └─────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│                     External Services                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│  │  Azure Storage  │ │   Google Gemini │ │     PayOS      │ │
│  │  - File Upload  │ │   - AI Quizzes  │ │   - Payments   │ │
│  └─────────────────┘ └─────────────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Các Tính Năng Chính

### 👨‍🎓 Dành cho Học Viên
- **Duyệt khóa học**: Xem danh sách và chi tiết khóa học
- **Đăng ký học**: Mua và đăng ký khóa học
- **Học tập trực tuyến**: Xem video bài giảng, tài liệu
- **Làm bài kiểm tra**: Quiz và exam với chấm điểm tự động
- **Theo dõi tiến độ**: Progress tracking chi tiết
- **Chứng chỉ**: Nhận chứng chỉ hoàn thành khóa học
- **Hỗ trợ chat**: Chat trực tiếp với giảng viên

### 👨‍💼 Dành cho Quản Trị Viên
- **Quản lý khóa học**: Tạo, chỉnh sửa, xóa khóa học
- **Quản lý người dùng**: Quản lý học viên và giảng viên
- **Quản lý nội dung**: Upload video, tài liệu, bài giảng
- **Thống kê báo cáo**: Dashboard với analytics chi tiết
- **Quản lý thanh toán**: Theo dõi doanh thu và giao dịch
- **Tạo quiz AI**: Tự động tạo bài kiểm tra từ tài liệu

### 🤖 AI Quiz Generator
- **Tự động tạo quiz**: Từ file DOCX và JSON
- **Đa cấp độ khó**: Easy, Medium, Hard
- **Giải thích đáp án**: AI cung cấp explanation
- **Batch processing**: Xử lý nhiều file cùng lúc

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **NestJS** - Framework Node.js cho API
- **TypeScript** - Ngôn ngữ lập trình chính
- **PostgreSQL** - Cơ sở dữ liệu chính
- **TypeORM** - Object-Relational Mapping
- **Redis** - Cache và session storage
- **JWT** - Authentication và authorization
- **WebSocket** - Real-time communication
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework với App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component library
- **NextAuth** - Authentication
- **Socket.io** - Real-time features

### AI Service
- **FastAPI** - Python web framework
- **Google Gemini** - AI model cho quiz generation
- **Python-docx** - Xử lý file Word
- **Pydantic** - Data validation

### DevOps & Infrastructure
- **Docker** - Containerization
- **Azure Storage** - File storage
- **PayOS** - Payment gateway
- **Vercel** - Deployment platform

## 📦 Cấu Trúc Dự Án

```
sell_course/
├── sell_course_nest/          # Backend API (NestJS)
│   ├── src/
│   │   ├── modules/           # Business modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── course/        # Course management
│   │   │   ├── user/          # User management
│   │   │   ├── enrollment/    # Enrollment system
│   │   │   ├── payment/       # Payment processing
│   │   │   ├── quizz/         # Quiz system
│   │   │   ├── exam/          # Exam system
│   │   │   ├── support_chat/  # Chat support
│   │   │   └── ...            # Other modules
│   │   └── utilities/         # Shared utilities
│   ├── docker-compose.yml     # Development containers
│   └── Dockerfile             # Production container
│
├── Sell_course_next/          # Frontend cho học viên
│   ├── app/                   # Next.js App Router
│   │   ├── courses/           # Course pages
│   │   ├── enrolled/          # Learning pages
│   │   ├── quiz/              # Quiz pages
│   │   ├── auth/              # Authentication
│   │   └── profile/           # User profile
│   ├── components/            # Reusable components
│   └── Dockerfile             # Production container
│
├── sell_course_next_admin/    # Admin Dashboard
│   ├── app/                   # Admin pages
│   │   ├── course/            # Course management
│   │   ├── users/             # User management
│   │   ├── exam/              # Exam management
│   │   └── settings/          # System settings
│   └── components/            # Admin components
│
└── quiz-generator-api/        # AI Quiz Generator
    ├── app/                   # FastAPI application
    ├── requirements.txt       # Python dependencies
    └── Dockerfile             # Container config
```

## 🚀 Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- **Node.js** 18+ (cho NestJS và Next.js)
- **Python** 3.9+ (cho AI service)
- **PostgreSQL** 13+
- **Redis** 6+
- **Docker** (tùy chọn)

### 1. Clone Repository
```bash
git clone https://github.com/Thuannnnnnn/sell_course.git
cd sell_course
```

### 2. Thiết Lập Backend (NestJS)
```bash
cd sell_course_nest

# Cài đặt dependencies
npm install

# Cấu hình environment
cp .env.example .env
# Chỉnh sửa .env với thông tin database, Redis, Azure, PayOS

# Chạy migrations
npm run migration:run

# Khởi động development server
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:8000`

### 3. Thiết Lập Frontend Học Viên
```bash
cd ../Sell_course_next

# Cài đặt dependencies
npm install

# Cấu hình environment
cp .env.example .env
# Cấu hình NextAuth và API URLs

# Khởi động development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 4. Thiết Lập Admin Dashboard
```bash
cd ../sell_course_next_admin

# Cài đặt dependencies
npm install

# Cấu hình environment (tương tự frontend)
cp .env.example .env

# Khởi động admin dashboard
npm run dev
```

Admin dashboard sẽ chạy tại: `http://localhost:5000`

### 5. Thiết Lập AI Quiz Generator
```bash
cd ../quiz-generator-api

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình Google Gemini API key
cp .env.example .env
# Thêm GEMINI_API_KEY vào .env

# Khởi động FastAPI server
python main.py
```

AI service sẽ chạy tại: `http://localhost:8000`

## 🐳 Chạy với Docker

### Development với Docker Compose
```bash
# Chạy tất cả services
docker-compose up -d

# Chỉ chạy database services
docker-compose up -d postgres redis

# Xem logs
docker-compose logs -f
```

### Production Deployment
```bash
# Build production images
docker build -t sell-course-backend ./sell_course_nest
docker build -t sell-course-frontend ./Sell_course_next
docker build -t sell-course-admin ./sell_course_next_admin
docker build -t quiz-generator ./quiz-generator-api

# Run containers
docker run -d -p 8000:8000 sell-course-backend
docker run -d -p 3000:3000 sell-course-frontend
docker run -d -p 5000:5000 sell-course-admin
docker run -d -p 8001:8000 quiz-generator
```

## 🔧 Cấu Hình Environment Variables

### Backend (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=sell_course
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Azure Storage
AZURE_STORAGE_ACCOUNT=your-account
AZURE_STORAGE_KEY=your-key
AZURE_CONTAINER_NAME=uploads

# PayOS
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email
MAIL_PASS=your-password
```

### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### AI Service (.env)
```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=2000
GEMINI_TEMPERATURE=0.7
```

## 📚 API Documentation

### Backend API
- **Swagger UI**: `http://localhost:8000/api-docs`
- **OpenAPI JSON**: `http://localhost:8000/api-json`

### AI Quiz Generator API
- **FastAPI Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Các Endpoint Chính

#### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/refresh` - Refresh token

#### Courses
- `GET /courses` - Danh sách khóa học
- `GET /courses/:id` - Chi tiết khóa học
- `POST /courses` - Tạo khóa học (admin)

#### Enrollment
- `POST /enrollment` - Đăng ký học
- `GET /enrollment/my-courses` - Khóa học đã đăng ký

#### Quiz Generation
- `POST /generate-quiz` - Tạo quiz từ file

## 🧪 Testing

### Backend Testing
```bash
cd sell_course_nest

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing
```bash
cd Sell_course_next

# Run tests
npm run test

# Lint code
npm run lint
```

## 🚀 Deployment

### Vercel Deployment (Frontend)
```bash
# Frontend
cd Sell_course_next
vercel --prod

# Admin Dashboard
cd ../sell_course_next_admin
vercel --prod
```

### Railway/Heroku (Backend)
```bash
# Build và deploy backend
cd sell_course_nest
npm run build
# Deploy theo hướng dẫn của platform
```

### Docker Production
```bash
# Build production images
./scripts/build-production.sh

# Deploy với docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Đóng Góp

### Quy Trình Phát Triển
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### Code Standards
- **TypeScript**: Sử dụng strict mode
- **Formatting**: Prettier với ESLint
- **Commit**: Conventional Commits format
- **Testing**: Unit tests cho logic quan trọng

### Git Hooks
```bash
# Cài đặt pre-commit hooks
npm install husky --save-dev
npx husky install
```

## 📄 License

Dự án này được phát hành dưới [MIT License](LICENSE).

## 👥 Team

- **Thuần** - Project Lead & Full-stack Developer
- **Contributors** - Xem [Contributors](https://github.com/Thuannnnnnn/sell_course/graphs/contributors)

## 📞 Liên Hệ

- **Email**: [your-email@example.com]
- **GitHub**: [Thuannnnnnn](https://github.com/Thuannnnnnn)

## 🔄 Workflow Phát Triển

### Local Development
```bash
# 1. Start database services
docker-compose up -d postgres redis

# 2. Start backend
cd sell_course_nest && npm run start:dev

# 3. Start frontend (terminal mới)
cd Sell_course_next && npm run dev

# 4. Start admin dashboard (terminal mới)
cd sell_course_next_admin && npm run dev

# 5. Start AI service (terminal mới)
cd quiz-generator-api && python main.py
```

### Database Management
```bash
# Tạo migration mới
npm run migration:create -- src/migrations/NewMigration

# Chạy migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Sync database (development only)
npm run schema:sync
```

## 🐛 Troubleshooting

### Các Lỗi Thường Gặp

#### 1. Database Connection Error
```bash
# Kiểm tra PostgreSQL đang chạy
sudo service postgresql status

# Kiểm tra cấu hình database trong .env
grep DATABASE_ .env
```

#### 2. Redis Connection Error
```bash
# Kiểm tra Redis đang chạy
redis-cli ping

# Khởi động Redis
sudo service redis-server start
```

#### 3. Port Already in Use
```bash
# Tìm process sử dụng port
lsof -i :3000

# Kill process
kill -9 PID
```

#### 4. Node Modules Issues
```bash
# Xóa và cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring và Analytics

### Health Checks
- Backend: `GET /health`
- Frontend: `/_next/static/health`
- AI Service: `GET /health`

### Logging
- Backend logs: `logs/application.log`
- Error tracking: Sentry integration
- Performance monitoring: New Relic

### Database Monitoring
```bash
# Kiểm tra database size
SELECT pg_size_pretty(pg_database_size('sell_course'));

# Active connections
SELECT count(*) FROM pg_stat_activity;
```

## 🔒 Security

### Authentication Flow
1. User login với email/password
2. Server validate và tạo JWT token
3. Client lưu token và gửi trong header
4. Server verify token cho mỗi request

### API Security
- **Rate Limiting**: 100 requests/minute
- **CORS**: Configured domains only
- **Helmet**: Security headers
- **Input Validation**: Class-validator
- **SQL Injection**: TypeORM parameterized queries

### File Upload Security
- **File Type**: Whitelist DOCX, PDF, MP4
- **File Size**: Max 100MB cho video, 10MB cho docs
- **Virus Scan**: ClamAV integration
- **Storage**: Azure Blob với private containers

## 🚀 Performance Optimization

### Backend Optimization
- **Caching**: Redis cho session và data
- **Database**: Index optimization
- **Compression**: Gzip response
- **Connection Pool**: TypeORM connection pooling

### Frontend Optimization
- **Static Generation**: Next.js SSG cho course listings
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Dynamic imports
- **CDN**: Vercel Edge Network

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
services:
  backend:
    image: sell-course-backend
    scale: 3
  
  nginx:
    image: nginx
    depends_on:
      - backend
```

### Database Scaling
- **Read Replicas**: PostgreSQL streaming replication
- **Connection Pooling**: PgBouncer
- **Caching**: Redis Cluster

## 🔧 DevOps

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: ./scripts/deploy.sh
```

### Infrastructure as Code
- **Docker Compose**: Development environment
- **Kubernetes**: Production deployment
- **Terraform**: Cloud infrastructure

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework  
- [Google Gemini](https://ai.google.dev/) - AI model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [PayOS](https://payos.vn/) - Payment gateway
- [TypeORM](https://typeorm.io/) - Database ORM
- [Radix UI](https://www.radix-ui.com/) - Component library

---

**🎓 Sell Course** - Nền tảng học tập trực tuyến hiện đại và thông minh

> Được phát triển với ❤️ bởi team Sell Course