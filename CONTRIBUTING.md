# Contributing Guidelines

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án Sell Course! Đây là hướng dẫn chi tiết về cách tham gia phát triển.

## 🤝 Các Cách Đóng Góp

- **Bug Reports**: Báo cáo lỗi qua GitHub Issues
- **Feature Requests**: Đề xuất tính năng mới
- **Code Contributions**: Gửi Pull Requests
- **Documentation**: Cải thiện tài liệu
- **Testing**: Viết test cases

## 📋 Quy Trình Đóng Góp

### 1. Fork và Clone
```bash
# Fork repository trên GitHub
# Clone fork về máy local
git clone https://github.com/your-username/sell_course.git
cd sell_course

# Add upstream remote
git remote add upstream https://github.com/Thuannnnnnn/sell_course.git
```

### 2. Thiết Lập Development Environment
```bash
# Cài đặt dependencies cho tất cả projects
npm run install:all

# Thiết lập database
npm run db:setup

# Chạy tests để đảm bảo mọi thứ hoạt động
npm run test:all
```

### 3. Tạo Feature Branch
```bash
# Sync với upstream
git fetch upstream
git checkout main
git merge upstream/main

# Tạo feature branch
git checkout -b feature/your-feature-name
```

### 4. Development
- Viết code theo coding standards
- Thêm tests cho features mới
- Update documentation nếu cần
- Commit thường xuyên với clear messages

### 5. Testing
```bash
# Chạy tests
npm run test

# Chạy linting
npm run lint

# Chạy type checking
npm run type-check
```

### 6. Submit Pull Request
```bash
# Push branch
git push origin feature/your-feature-name

# Tạo Pull Request trên GitHub
```

## 📝 Coding Standards

### TypeScript/JavaScript
- Sử dụng TypeScript strict mode
- ESLint + Prettier configuration
- Camel case cho variables và functions
- Pascal case cho classes và interfaces

### Naming Conventions
```typescript
// Files
user.controller.ts
user.service.ts
user.entity.ts

// Classes
export class UserController {}
export class UserService {}

// Interfaces
export interface IUserRepository {}
export interface UserDto {}

// Constants
export const DEFAULT_PAGE_SIZE = 10;
```

### Git Commit Messages
Sử dụng Conventional Commits format:
```
type(scope): description

feat(auth): add Google OAuth integration
fix(quiz): resolve quiz generation timeout
docs(readme): update installation instructions
refactor(user): simplify user profile logic
test(course): add unit tests for course service
```

### API Design
```typescript
// REST endpoints
GET    /api/v1/courses
POST   /api/v1/courses
GET    /api/v1/courses/:id
PUT    /api/v1/courses/:id
DELETE /api/v1/courses/:id

// Response format
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string | null
}
```

## 🧪 Testing Guidelines

### Unit Tests
```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const result = await userService.create(userData);
    
    expect(result).toBeDefined();
    expect(result.email).toBe(userData.email);
  });
});
```

### Integration Tests
```typescript
describe('User API', () => {
  it('POST /users should create user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);
      
    expect(response.body.data.email).toBe('test@example.com');
  });
});
```

### E2E Tests
```typescript
test('user can complete course enrollment flow', async ({ page }) => {
  await page.goto('/courses');
  await page.click('[data-testid="enroll-button"]');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');
  
  await expect(page).toHaveURL('/enrolled');
});
```

## 🔍 Code Review Process

### Pull Request Checklist
- [ ] Code follows project conventions
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

### Review Criteria
- **Functionality**: Does it work as intended?
- **Code Quality**: Is it clean and maintainable?
- **Performance**: Are there any bottlenecks?
- **Security**: Are there any vulnerabilities?
- **Testing**: Is it adequately tested?

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Add any other context or screenshots.
```

## 📚 Documentation

### README Updates
- Keep installation instructions current
- Update feature lists when adding new functionality
- Maintain accurate technology stack information

### Code Documentation
```typescript
/**
 * Creates a new course with the provided data
 * @param courseData - The course information
 * @param userId - ID of the user creating the course
 * @returns Promise<Course> - The created course
 * @throws {ValidationError} When course data is invalid
 * @throws {UnauthorizedError} When user lacks permissions
 */
async createCourse(courseData: CreateCourseDto, userId: string): Promise<Course> {
  // Implementation
}
```

## 🏷️ Labels và Priority

### Issue Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

## 🎯 Development Focus Areas

### High Priority
- Core learning features
- Payment integration
- Security improvements
- Performance optimization

### Medium Priority
- UI/UX enhancements
- Additional integrations
- Mobile responsiveness
- Analytics features

### Low Priority
- Nice-to-have features
- Experimental functionality
- Optional integrations

## 🔄 Release Process

### Version Numbering
Sử dụng Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version numbers bumped
- [ ] CHANGELOG.md updated
- [ ] Release notes prepared
- [ ] Production deployment tested

## 🤔 Questions?

Nếu bạn có bất kỳ câu hỏi nào về việc đóng góp, hãy:
- Mở một GitHub Issue với label `question`
- Liên hệ qua email: [maintainer-email]
- Tham gia Discord server: [discord-link]

Cảm ơn bạn đã đóng góp cho Sell Course! 🎓