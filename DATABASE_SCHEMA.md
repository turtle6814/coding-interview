# Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐
│    app_user     │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password        │
│ role            │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         ├──────────────────┐
         │                  │
┌────────▼────────┐  ┌─────▼──────────┐
│   candidates    │  │   questions    │
├─────────────────┤  ├────────────────┤
│ id (PK, FK)     │  │ id (PK)        │
│ phone           │  │ title          │
│ resume_url      │  │ description    │
│ status          │  │ difficulty     │
│ notes           │  │ topic          │
└─────────────────┘  │ sample_input   │
                     │ sample_output  │
                     │ hints          │
                     │ starter_code   │
                     │ time_limit     │
                     │ created_by(FK) │
                     │ created_at     │
                     │ updated_at     │
                     └────────┬───────┘
                              │
                     ┌────────▼────────────┐
                     │    test_cases       │
                     ├─────────────────────┤
                     │ id (PK)             │
                     │ question_id (FK)    │
                     │ input               │
                     │ expected_output     │
                     │ is_hidden           │
                     │ points              │
                     │ time_limit          │
                     │ memory_limit        │
                     │ description         │
                     │ created_at          │
                     └─────────────────────┘

┌──────────────────────────┐
│   interview_sessions     │
├──────────────────────────┤
│ id (PK)                  │
│ question_id (FK)         │
│ candidate_id (FK)        │
│ interviewer_id (FK)      │
│ language                 │
│ code                     │
│ status                   │
│ scheduled_start_time     │
│ actual_start_time        │
│ end_time                 │
│ timer_duration           │
│ timer_remaining          │
│ timer_status             │
│ interviewer_feedback     │
│ rating                   │
│ score                    │
│ created_at               │
│ updated_at               │
└──────────────────────────┘
           │
           ├──────────────┬──────────────┬──────────────┐
           │              │              │              │
    ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼──────────┐
    │   notes     │ │ messages │ │code_history │ │code_comments  │
    ├─────────────┤ ├──────────┤ ├─────────────┤ ├───────────────┤
    │ id (PK)     │ │ id (PK)  │ │ id (PK)     │ │ id (PK)       │
    │ session_id  │ │session_id│ │ session_id  │ │ session_id    │
    │ author_id   │ │sender_id │ │ user_id(FK) │ │ author_id(FK) │
    │ content     │ │ content  │ │ code        │ │ line_number   │
    │ is_private  │ │ type     │ │ language    │ │ content       │
    │code_snapshot│ │created_at│ │ change_type │ │ resolved      │
    │ line_number │ └──────────┘ │ timestamp   │ │ resolved_by   │
    │ type        │              └─────────────┘ │ resolved_at   │
    │ created_at  │                              │ created_at    │
    │ updated_at  │                              │ updated_at    │
    └─────────────┘                              └───────────────┘

    ┌─────────────────────┐
    │  execution_results  │
    ├─────────────────────┤
    │ id (PK)             │
    │ session_id          │
    │ test_case_id (FK)   │
    │ passed              │
    │ actual_output       │
    │ error_message       │
    │ execution_time      │
    │ memory_used         │
    │ exit_code           │
    │ stdout              │
    │ stderr              │
    │ compile_output      │
    │ executed_at         │
    └─────────────────────┘
```

---

## Table Definitions

### app_user
Base user table with authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| username | VARCHAR(100) | NOT NULL, UNIQUE | User's login name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | NOT NULL | INTERVIEWER, CANDIDATE, or ADMIN |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- `idx_username` ON username
- `idx_email` ON email

---

### candidates
Extends app_user for candidate-specific information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY, FK → app_user.id | User ID |
| phone | VARCHAR(20) | | Contact phone number |
| resume_url | VARCHAR(500) | | URL to resume/CV |
| status | VARCHAR(50) | NOT NULL | INVITED, ACTIVE, COMPLETED, WITHDRAWN |
| notes | TEXT | | Internal notes about candidate |

---

### questions
Coding interview questions/problems.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| title | VARCHAR(255) | NOT NULL | Question title |
| description | TEXT | NOT NULL | Full problem description |
| difficulty | VARCHAR(50) | NOT NULL | EASY, MEDIUM, or HARD |
| topic | VARCHAR(100) | NOT NULL | Problem category (arrays, strings, etc) |
| sample_input | TEXT | | Example input |
| sample_output | TEXT | | Expected output for sample input |
| hints | TEXT | | Hints for candidates |
| starter_code | TEXT | | Pre-populated code template |
| time_limit | INTEGER | | Recommended time limit in minutes |
| created_by | VARCHAR(255) | FK → app_user.id | Question author |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- `idx_difficulty` ON difficulty
- `idx_topic` ON topic
- `idx_created_by` ON created_by

---

### test_cases
Test cases for validating candidate solutions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| question_id | VARCHAR(255) | NOT NULL, FK → questions.id | Parent question |
| input | TEXT | NOT NULL | Test input data |
| expected_output | TEXT | NOT NULL | Expected result |
| is_hidden | BOOLEAN | NOT NULL, DEFAULT false | Hidden from candidates |
| points | INTEGER | NOT NULL, DEFAULT 10 | Points awarded for passing |
| time_limit | INTEGER | | Max execution time (seconds) |
| memory_limit | INTEGER | | Max memory usage (MB) |
| description | TEXT | | Test case description |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Indexes:**
- `idx_question_id` ON question_id

**Cascade:**
- DELETE ON questions.id → DELETE test_cases

---

### interview_sessions
Active or completed interview sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| question_id | VARCHAR(255) | FK → questions.id | Assigned question |
| candidate_id | VARCHAR(255) | FK → app_user.id | Candidate user |
| interviewer_id | VARCHAR(255) | FK → app_user.id | Interviewer user |
| language | VARCHAR(50) | NOT NULL | Programming language |
| code | TEXT | | Current code content |
| status | VARCHAR(50) | NOT NULL | SCHEDULED, ACTIVE, PAUSED, COMPLETED, CANCELLED, REVIEWED |
| scheduled_start_time | TIMESTAMP | | Planned start time |
| actual_start_time | TIMESTAMP | | Actual start time |
| end_time | TIMESTAMP | | Session end time |
| timer_duration | INTEGER | | Timer duration (minutes) |
| timer_remaining | INTEGER | | Remaining time (seconds) |
| timer_status | VARCHAR(50) | | NOT_STARTED, RUNNING, PAUSED, EXPIRED |
| interviewer_feedback | TEXT | | Final evaluation notes |
| rating | INTEGER | | Rating 1-5 |
| score | DOUBLE | | Test score percentage |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- `idx_candidate_id` ON candidate_id
- `idx_interviewer_id` ON interviewer_id
- `idx_status` ON status
- `idx_scheduled_time` ON scheduled_start_time

---

### execution_results
Results of code execution against test cases.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| session_id | VARCHAR(255) | NOT NULL | Session identifier |
| test_case_id | VARCHAR(255) | FK → test_cases.id | Test case executed |
| passed | BOOLEAN | NOT NULL | Whether test passed |
| actual_output | TEXT | | Program output |
| error_message | TEXT | | Error description if failed |
| execution_time | INTEGER | | Runtime in milliseconds |
| memory_used | DOUBLE | | Memory usage in MB |
| exit_code | INTEGER | | Program exit code |
| stdout | TEXT | | Standard output |
| stderr | TEXT | | Standard error |
| compile_output | TEXT | | Compilation errors |
| executed_at | TIMESTAMP | NOT NULL | Execution timestamp |

**Indexes:**
- `idx_session_id` ON session_id
- `idx_executed_at` ON executed_at

---

### notes
Interviewer and candidate notes during sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| session_id | VARCHAR(255) | NOT NULL | Session identifier |
| author_id | VARCHAR(255) | NOT NULL, FK → app_user.id | Note author |
| content | TEXT | NOT NULL | Note content |
| is_private | BOOLEAN | NOT NULL, DEFAULT false | Visible only to interviewer |
| code_snapshot | TEXT | | Code at time of note |
| line_number | INTEGER | | Line number for code comments |
| type | VARCHAR(50) | NOT NULL | GENERAL, CODE_COMMENT, EVALUATION, FEEDBACK |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- `idx_session_id` ON session_id
- `idx_created_at` ON created_at

---

### messages
Chat messages between participants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| session_id | VARCHAR(255) | NOT NULL | Session identifier |
| sender_id | VARCHAR(255) | NOT NULL, FK → app_user.id | Message sender |
| content | TEXT | NOT NULL | Message text |
| type | VARCHAR(50) | NOT NULL | TEXT, SYSTEM, CODE_SNIPPET |
| created_at | TIMESTAMP | NOT NULL | Send timestamp |

**Indexes:**
- `idx_session_id_created` ON (session_id, created_at)

---

### code_history
Timeline of code changes for playback.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| session_id | VARCHAR(255) | NOT NULL | Session identifier |
| user_id | VARCHAR(255) | FK → app_user.id | User who made change |
| code | TEXT | NOT NULL | Code snapshot |
| language | VARCHAR(50) | NOT NULL | Programming language |
| change_type | VARCHAR(50) | NOT NULL | EDIT, EXECUTE, SAVE, LANGUAGE_CHANGE |
| change_description | TEXT | | Description of change |
| timestamp | TIMESTAMP | NOT NULL | Change timestamp |

**Indexes:**
- `idx_session_timestamp` ON (session_id, timestamp)

---

### code_comments
Inline code comments/annotations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | UUID |
| session_id | VARCHAR(255) | NOT NULL | Session identifier |
| author_id | VARCHAR(255) | NOT NULL, FK → app_user.id | Comment author |
| line_number | INTEGER | NOT NULL | Line number in code |
| content | TEXT | NOT NULL | Comment text |
| resolved | BOOLEAN | NOT NULL, DEFAULT false | Whether addressed |
| resolved_by | VARCHAR(255) | FK → app_user.id | User who resolved |
| resolved_at | TIMESTAMP | | Resolution timestamp |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

**Indexes:**
- `idx_session_line` ON (session_id, line_number)
- `idx_resolved` ON resolved

---

## Data Relationships

### One-to-Many
- `app_user` → `questions` (created_by)
- `app_user` → `interview_sessions` (candidate)
- `app_user` → `interview_sessions` (interviewer)
- `questions` → `test_cases`
- `interview_sessions` → `notes`
- `interview_sessions` → `messages`
- `interview_sessions` → `code_history`
- `interview_sessions` → `code_comments`
- `interview_sessions` → `execution_results`
- `test_cases` → `execution_results`

### Inheritance
- `app_user` ← `candidates` (JOINED table inheritance)

---

## Sample Queries

### Get all active interview sessions for an interviewer
```sql
SELECT * FROM interview_sessions
WHERE interviewer_id = ? AND status = 'ACTIVE'
ORDER BY actual_start_time DESC;
```

### Get test results summary for a session
```sql
SELECT 
  COUNT(*) as total_cases,
  SUM(CASE WHEN passed = true THEN 1 ELSE 0 END) as passed_cases,
  SUM(points) as total_points,
  SUM(CASE WHEN passed = true THEN tc.points ELSE 0 END) as earned_points
FROM execution_results er
JOIN test_cases tc ON er.test_case_id = tc.id
WHERE er.session_id = ?
GROUP BY er.session_id;
```

### Get session chat history
```sql
SELECT m.*, u.username as sender_name
FROM messages m
JOIN app_user u ON m.sender_id = u.id
WHERE m.session_id = ?
ORDER BY m.created_at ASC;
```

### Get questions by difficulty with test case count
```sql
SELECT q.*, COUNT(tc.id) as test_case_count
FROM questions q
LEFT JOIN test_cases tc ON q.id = tc.question_id
WHERE q.difficulty = 'MEDIUM'
GROUP BY q.id
ORDER BY q.created_at DESC;
```
