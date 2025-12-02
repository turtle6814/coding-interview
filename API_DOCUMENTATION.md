# Coding Interview Platform - API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "INTERVIEWER" | "CANDIDATE"
}
```

**Response:** `201 Created`
```json
{
  "token": "jwt_token",
  "username": "string",
  "email": "string",
  "role": "INTERVIEWER",
  "userId": "uuid"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK` - Same as register response

### Validate Token
```http
GET /api/auth/validate
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "valid": true
}
```

---

## Question Management (INTERVIEWER/ADMIN only)

### Get All Questions
```http
GET /api/questions?difficulty=EASY&topic=arrays
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Two Sum",
    "description": "Given an array...",
    "difficulty": "EASY",
    "topic": "arrays",
    "sampleInput": "[2,7,11,15], target=9",
    "sampleOutput": "[0,1]",
    "hints": "Use hash map",
    "starterCode": "function twoSum(nums, target) {\n  \n}",
    "timeLimit": 45,
    "createdBy": "username"
  }
]
```

### Get Question by ID
```http
GET /api/questions/{id}
```

### Create Question
```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "topic": "string",
  "sampleInput": "string",
  "sampleOutput": "string",
  "hints": "string",
  "starterCode": "string",
  "timeLimit": 45
}
```

**Response:** `201 Created` - Returns created question

### Update Question
```http
PUT /api/questions/{id}
Authorization: Bearer <token>
```

### Delete Question
```http
DELETE /api/questions/{id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`

### Get Test Cases
```http
GET /api/questions/{id}/test-cases?includeHidden=false
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "input": "[2,7,11,15]\n9",
    "expectedOutput": "[0,1]",
    "isHidden": false,
    "points": 10,
    "timeLimit": 2,
    "memoryLimit": 256,
    "description": "Example case"
  }
]
```

### Add Test Case
```http
POST /api/questions/{id}/test-cases
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": "string",
  "expectedOutput": "string",
  "isHidden": false,
  "points": 10,
  "timeLimit": 2,
  "memoryLimit": 256,
  "description": "string"
}
```

### Delete Test Case
```http
DELETE /api/questions/test-cases/{testCaseId}
Authorization: Bearer <token>
```

---

## Interview Session Management

### Create Interview Session
```http
POST /api/interview-sessions
Authorization: Bearer <token> (INTERVIEWER only)
Content-Type: application/json

{
  "questionId": "uuid",
  "candidateId": "uuid",
  "interviewerId": "uuid",
  "timerDuration": 45
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "question": { ... },
  "candidate": { ... },
  "interviewer": { ... },
  "language": "javascript",
  "code": "...",
  "status": "SCHEDULED",
  "timerDuration": 45,
  "timerRemaining": 2700,
  "timerStatus": "NOT_STARTED",
  "score": null,
  "createdAt": "2025-12-02T10:00:00"
}
```

### Get Session by ID
```http
GET /api/interview-sessions/{id}
Authorization: Bearer <token>
```

### Get Sessions by Candidate
```http
GET /api/interview-sessions/candidate/{candidateId}
Authorization: Bearer <token>
```

### Get Sessions by Interviewer
```http
GET /api/interview-sessions/interviewer/{interviewerId}
Authorization: Bearer <token> (INTERVIEWER only)
```

### Start Session
```http
PUT /api/interview-sessions/{id}/start
Authorization: Bearer <token>
```

### End Session
```http
PUT /api/interview-sessions/{id}/end
Authorization: Bearer <token>
```

### Timer Controls (INTERVIEWER only)

#### Start Timer
```http
PUT /api/interview-sessions/{id}/timer/start
Authorization: Bearer <token>
```

#### Pause Timer
```http
PUT /api/interview-sessions/{id}/timer/pause
Authorization: Bearer <token>
```

#### Update Timer
```http
PUT /api/interview-sessions/{id}/timer
Authorization: Bearer <token>
Content-Type: application/json

{
  "seconds": 2700
}
```

### Add Feedback
```http
PUT /api/interview-sessions/{id}/feedback
Authorization: Bearer <token> (INTERVIEWER only)
Content-Type: application/json

{
  "feedback": "Great problem-solving skills...",
  "rating": 4
}
```

---

## Code Evaluation

### Evaluate Session Code
```http
POST /api/evaluation/session/{sessionId}
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "passedCount": 8,
  "totalCount": 10,
  "earnedPoints": 80,
  "totalPoints": 100,
  "scorePercentage": 80.0,
  "testResults": [
    {
      "testCaseId": "uuid",
      "passed": true,
      "isHidden": false,
      "points": 10,
      "input": "[2,7,11,15]\n9",
      "expectedOutput": "[0,1]",
      "actualOutput": "[0,1]",
      "description": "Example case"
    }
  ]
}
```

### Get Session Results
```http
GET /api/evaluation/session/{sessionId}/results
Authorization: Bearer <token>
```

---

## Notes

### Create Note
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "uuid",
  "authorId": "uuid",
  "content": "string",
  "isPrivate": false,
  "codeSnapshot": "...",
  "lineNumber": 42,
  "type": "GENERAL" | "CODE_COMMENT" | "EVALUATION" | "FEEDBACK"
}
```

**Response:** `201 Created`

### Get Session Notes
```http
GET /api/notes/session/{sessionId}?includePrivate=false
Authorization: Bearer <token>
```

### Delete Note
```http
DELETE /api/notes/{noteId}
Authorization: Bearer <token> (INTERVIEWER only)
```

---

## Chat

### Send Message
```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "uuid",
  "senderId": "uuid",
  "content": "string",
  "type": "TEXT" | "SYSTEM" | "CODE_SNIPPET"
}
```

**Response:** `201 Created`

### Get Session Messages
```http
GET /api/chat/session/{sessionId}
Authorization: Bearer <token>
```

---

## WebSocket Events

### Connection
```javascript
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
  console.log('Connected: ' + frame);
});
```

### Subscribe to Events

#### Code Updates
```javascript
stompClient.subscribe('/topic/session/{sessionId}', function(message) {
  const update = JSON.parse(message.body);
  // { code: "...", userId: "...", timestamp: 123456 }
});
```

#### Evaluation Results
```javascript
stompClient.subscribe('/topic/session/{sessionId}/evaluation', function(message) {
  const results = JSON.parse(message.body);
});
```

#### Session Status
```javascript
stompClient.subscribe('/topic/session/{sessionId}/status', function(message) {
  const status = JSON.parse(message.body);
  // { status: "ACTIVE", startTime: "..." }
});
```

#### Timer Events
```javascript
stompClient.subscribe('/topic/session/{sessionId}/timer', function(message) {
  const timer = JSON.parse(message.body);
  // { action: "start", remaining: 2700 }
});
```

#### Chat Messages
```javascript
stompClient.subscribe('/topic/session/{sessionId}/chat', function(message) {
  const chatMessage = JSON.parse(message.body);
});
```

#### Notes (Public)
```javascript
stompClient.subscribe('/topic/session/{sessionId}/notes', function(message) {
  const note = JSON.parse(message.body);
});
```

#### Notes (Private - Interviewer only)
```javascript
stompClient.subscribe('/topic/session/{sessionId}/notes/private', function(message) {
  const privateNote = JSON.parse(message.body);
});
```

### Send Code Update
```javascript
stompClient.send('/app/session/{sessionId}/code', {}, JSON.stringify({
  code: "console.log('hello');",
  userId: "user-id",
  timestamp: Date.now()
}));
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": ["Username is required"]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid username or password"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
