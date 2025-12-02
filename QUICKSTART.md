# Quick Start Guide - Coding Interview Platform

## Prerequisites

- **Java 21** - `java -version`
- **Maven 3.8+** - `mvn -version`
- **Node.js 18+** - `node -version`
- **PostgreSQL 14+** - Running on port 5432
- **Git** - For version control

---

## 🚀 Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb coding_interview

# Or using psql
psql -U postgres
CREATE DATABASE coding_interview;
\q
```

### 2. Backend Setup

```bash
cd backend

# Create .env file
cat > .env << EOF
DATABASE_URL=jdbc:postgresql://localhost:5432/coding_interview
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits-long-change-this
RAPIDAPI_KEY=your_rapidapi_key_for_judge0
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
EOF

# Install dependencies and run
mvn clean install
mvn spring-boot:run
```

**Backend should start on:** `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend should start on:** `http://localhost:5173`

---

## 📝 First Time Usage

### 1. Register a New Account

1. Open `http://localhost:5173/register`
2. Fill in:
   - Username: `interviewer1`
   - Email: `interviewer@example.com`
   - Password: `password123`
   - Role: **Interviewer**
3. Click "Sign Up"

### 2. Create a Question (Interviewer Only)

```bash
# Using curl or Postman
curl -X POST http://localhost:8080/api/questions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "EASY",
    "topic": "arrays",
    "sampleInput": "[2,7,11,15], target=9",
    "sampleOutput": "[0,1]",
    "starterCode": "function twoSum(nums, target) {\n  // Your code here\n}",
    "timeLimit": 30
  }'
```

### 3. Add Test Cases

```bash
curl -X POST http://localhost:8080/api/questions/QUESTION_ID/test-cases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "[2,7,11,15]\n9",
    "expectedOutput": "[0,1]",
    "isHidden": false,
    "points": 10,
    "description": "Basic example case"
  }'
```

### 4. Create Interview Session

```bash
curl -X POST http://localhost:8080/api/interview-sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "QUESTION_ID",
    "candidateId": "CANDIDATE_USER_ID",
    "interviewerId": "INTERVIEWER_USER_ID",
    "timerDuration": 45
  }'
```

### 5. Join Interview Session

1. Navigate to: `http://localhost:5173/session/SESSION_ID`
2. Start coding!
3. Click "Run Code" to execute
4. Click "Submit" to run against all test cases

---

## 🧪 Testing the Platform

### Backend API Tests

```bash
cd backend

# Run tests
mvn test

# Run with coverage
mvn clean test jacoco:report
```

### Frontend E2E Tests

```bash
cd frontend

# Run Playwright tests
npx playwright test

# View test report
npx playwright show-report
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/validate` - Validate token

### Questions (Interviewer only)
- `GET /api/questions` - List all questions
- `POST /api/questions` - Create question
- `GET /api/questions/{id}` - Get question
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question
- `GET /api/questions/{id}/test-cases` - Get test cases
- `POST /api/questions/{id}/test-cases` - Add test case

### Interview Sessions
- `POST /api/interview-sessions` - Create session
- `GET /api/interview-sessions/{id}` - Get session
- `PUT /api/interview-sessions/{id}/start` - Start session
- `PUT /api/interview-sessions/{id}/end` - End session
- `PUT /api/interview-sessions/{id}/timer/start` - Start timer
- `PUT /api/interview-sessions/{id}/timer/pause` - Pause timer

### Evaluation
- `POST /api/evaluation/session/{sessionId}` - Run auto-grading
- `GET /api/evaluation/session/{sessionId}/results` - Get results

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

---

## 🔧 Common Issues & Solutions

### Issue: "Port 8080 already in use"
```bash
# Find process using port 8080
lsof -i :8080
# Kill the process
kill -9 PID
```

### Issue: "Database connection refused"
```bash
# Check if PostgreSQL is running
sudo service postgresql status
# Start PostgreSQL
sudo service postgresql start
```

### Issue: "JWT token invalid"
- Token expires after 24 hours
- Login again to get a new token
- Check `.env` file has correct `JWT_SECRET`

### Issue: "Judge0 API not configured"
- Get free API key from: https://rapidapi.com/judge0-official/api/judge0-ce
- Add to `.env`: `RAPIDAPI_KEY=your_key`
- Restart backend

---

## 🌐 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/coding_interview
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# JWT (MUST BE AT LEAST 256 BITS)
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits-long-change-this-in-production

# Email (Optional - for invitations)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# Judge0 (Required for code execution)
RAPIDAPI_KEY=your_rapidapi_key
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
```

---

## 📊 Project Structure

```
coding-interview/
├── backend/                # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/codinginterview/platform/
│   │       ├── config/     # Security, WebSocket config
│   │       ├── controller/ # REST controllers
│   │       ├── domain/     # JPA entities
│   │       ├── dto/        # Data transfer objects
│   │       ├── repository/ # JPA repositories
│   │       ├── security/   # JWT, filters
│   │       └── service/    # Business logic
│   ├── pom.xml
│   └── .env
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── services/       # API client
│   ├── package.json
│   └── .env
├── API_DOCUMENTATION.md    # Full API reference
├── DATABASE_SCHEMA.md      # Database design
├── IMPLEMENTATION_SUMMARY.md
└── QUICKSTART.md          # This file
```

---

## 🎯 Next Steps

1. **Create Questions** - Build your question bank
2. **Invite Candidates** - Register candidate accounts
3. **Schedule Interviews** - Create interview sessions
4. **Conduct Interviews** - Use real-time collaboration
5. **Review Results** - Check auto-grading results
6. **Export Reports** - Download session summaries

---

## 🔐 Default Credentials (Development Only)

**Do not use in production!**

After first run, you can manually insert a test admin:

```sql
INSERT INTO app_user (id, username, email, password, role, created_at, updated_at)
VALUES (
  'admin-001',
  'admin',
  'admin@example.com',
  '$2a$10$xbxPEJfZjjZbzgYQ3xZxK.0vX1XPZ5zN4kZwqJ5zQ5Z0zQ5Z0zQ5Z', -- password: admin123
  'ADMIN',
  NOW(),
  NOW()
);
```

---

## 📞 Support

For issues, questions, or contributions:
- Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
- Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API usage
- Check [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database structure

---

## 🚀 Production Deployment

See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) section "Deployment Checklist" for production setup including:
- SSL configuration
- Database migrations
- Environment variables
- Monitoring setup
- Scaling strategies

---

**Platform Status:** ✅ Backend Complete | 🔄 Frontend In Progress

**Ready for:** Local Development, Testing, and Demo
