# System Architecture - Coding Interview Platform

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Login/     │  │   Question   │  │  Interview   │  │   Session    │   │
│  │   Register   │  │     Bank     │  │    Setup     │  │   Review     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Interviewer Session View                                │   │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │ Question│ │   Code   │ │ Grading │ │  Chat  │ │ Notes  │       │   │
│  │  │  Panel  │ │  Editor  │ │  Panel  │ │ Panel  │ │ Panel  │       │   │
│  │  └─────────┘ └──────────┘ └─────────┘ └────────┘ └────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Candidate Session View                                  │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────┐                    │   │
│  │  │ Question│ │   Code   │ │  Chat  │ │ Submit │                    │   │
│  │  │  Panel  │ │  Editor  │ │ Panel  │ │ Button │                    │   │
│  │  └─────────┘ └──────────┘ └────────┘ └────────┘                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│                          React + TypeScript + Vite                           │
│                     Monaco Editor | TailwindCSS | STOMP.js                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ HTTPS/WSS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY / LOAD BALANCER                         │
│                         (Nginx / AWS ALB / Cloud Load Balancer)              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
                   ▼                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│       APPLICATION LAYER          │  │       APPLICATION LAYER          │
│      (Backend Instance 1)        │  │      (Backend Instance 2)        │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│                                  │  │                                  │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │   REST Controllers         │ │  │  │   REST Controllers         │ │
│  ├────────────────────────────┤ │  │  ├────────────────────────────┤ │
│  │ • AuthController           │ │  │  │ • AuthController           │ │
│  │ • QuestionController       │ │  │  │ • QuestionController       │ │
│  │ • InterviewSessionCtrl     │ │  │  │ • InterviewSessionCtrl     │ │
│  │ • EvaluationController     │ │  │  │ • EvaluationController     │ │
│  │ • NoteController           │ │  │  │ • NoteController           │ │
│  │ • ChatController           │ │  │  │ • ChatController           │ │
│  └────────────────────────────┘ │  │  └────────────────────────────┘ │
│                                  │  │                                  │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │   WebSocket Handler        │ │  │  │   WebSocket Handler        │ │
│  ├────────────────────────────┤ │  │  ├────────────────────────────┤ │
│  │ • Code collaboration       │ │  │  │ • Code collaboration       │ │
│  │ • Real-time chat           │ │  │  │ • Real-time chat           │ │
│  │ • Evaluation broadcast     │ │  │  │ • Evaluation broadcast     │ │
│  │ • Timer events             │ │  │  │ • Timer events             │ │
│  └────────────────────────────┘ │  │  └────────────────────────────┘ │
│                                  │  │                                  │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │   Service Layer            │ │  │  │   Service Layer            │ │
│  ├────────────────────────────┤ │  │  ├────────────────────────────┤ │
│  │ • QuestionService          │ │  │  │ • QuestionService          │ │
│  │ • InterviewSessionService  │ │  │  │ • InterviewSessionService  │ │
│  │ • EvaluationService        │ │  │  │ • EvaluationService        │ │
│  │ • Judge0Service            │ │  │  │ • Judge0Service            │ │
│  │ • NoteService              │ │  │  │ • NoteService              │ │
│  │ • ChatService              │ │  │  │ • ChatService              │ │
│  └────────────────────────────┘ │  │  └────────────────────────────┘ │
│                                  │  │                                  │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │   Security Layer           │ │  │  │   Security Layer           │ │
│  ├────────────────────────────┤ │  │  ├────────────────────────────┤ │
│  │ • JWT Authentication       │ │  │  │ • JWT Authentication       │ │
│  │ • Role-based Access        │ │  │  │ • Role-based Access        │ │
│  │ • CORS Configuration       │ │  │  │ • CORS Configuration       │ │
│  └────────────────────────────┘ │  │  └────────────────────────────┘ │
│                                  │  │                                  │
│    Spring Boot 3.2 + Java 21    │  │    Spring Boot 3.2 + Java 21    │
└──────────────────────────────────┘  └──────────────────────────────────┘
                   │                                       │
                   └───────────────────┬───────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MESSAGE BROKER (Future)                            │
│                        Redis Pub/Sub / RabbitMQ / Kafka                      │
│                   (For distributed WebSocket message routing)                │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
                   ▼                                       ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│       DATA LAYER                 │  │     EXTERNAL SERVICES            │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│                                  │  │                                  │
│  ┌────────────────────────────┐ │  │  ┌────────────────────────────┐ │
│  │   PostgreSQL Database      │ │  │  │   Judge0 API               │ │
│  ├────────────────────────────┤ │  │  ├────────────────────────────┤ │
│  │ • app_user                 │ │  │  │ • Code execution           │ │
│  │ • candidates               │ │  │  │ • 13+ languages            │ │
│  │ • questions                │ │  │  │ • Sandboxed environment    │ │
│  │ • test_cases               │ │  │  │ • Output capture           │ │
│  │ • interview_sessions       │ │  │  └────────────────────────────┘ │
│  │ • execution_results        │ │  │                                  │
│  │ • notes                    │ │  │  ┌────────────────────────────┐ │
│  │ • messages                 │ │  │  │   Email Service (SMTP)     │ │
│  │ • code_history             │ │  │  ├────────────────────────────┤ │
│  │ • code_comments            │ │  │  │ • Interview invitations    │ │
│  └────────────────────────────┘ │  │  │ • Password reset           │ │
│                                  │  │  │ • Notifications            │ │
│  Connection Pooling: HikariCP   │  │  └────────────────────────────┘ │
│  ORM: Hibernate / JPA           │  │                                  │
└──────────────────────────────────┘  └──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CACHING LAYER (Future)                               │
│                              Redis / Memcached                               │
│                        (Questions, Sessions, User data)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### 1. Authentication Flow

```
User → Frontend → POST /api/auth/login → AuthController
                                              ↓
                                      UserDetailsService
                                              ↓
                                    UserRepository → DB
                                              ↓
                                      Generate JWT
                                              ↓
                                      Return Token
                                              ↓
Frontend stores token in localStorage
                                              ↓
All future requests include: Authorization: Bearer <token>
                                              ↓
                        JwtAuthenticationFilter validates
                                              ↓
                          Sets SecurityContext
                                              ↓
                          Request proceeds
```

### 2. Interview Session Creation Flow

```
Interviewer → Create Session UI → POST /api/interview-sessions
                                              ↓
                           InterviewSessionController
                                (requires INTERVIEWER role)
                                              ↓
                           InterviewSessionService
                                              ↓
                    Fetch Question, Candidate, Interviewer
                                              ↓
                           Create Session Entity
                                              ↓
                             Save to Database
                                              ↓
                          Return Session Object
                                              ↓
Candidate receives invitation email (future feature)
                                              ↓
Both parties navigate to: /session/{sessionId}
```

### 3. Real-Time Collaboration Flow

```
User types code → Frontend debounces (1s) → WebSocket SEND
                                              ↓
                        /app/session/{id}/code
                                              ↓
                        CollaborationController
                                              ↓
                           SessionService.updateCode()
                                              ↓
                             Save to Database
                                              ↓
                  Broadcast to /topic/session/{id}
                                              ↓
                 All connected clients receive update
                                              ↓
                    Monaco editor updates (if not sender)
```

### 4. Auto-Grading Flow

```
User clicks "Submit" → POST /api/evaluation/session/{id}
                                              ↓
                           EvaluationController
                                              ↓
                            EvaluationService
                                              ↓
                    Fetch all test cases for question
                                              ↓
        For each test case:
            ┌───────────────────────────────┐
            │ Execute code via Judge0       │
            │ Compare actual vs expected    │
            │ Record pass/fail              │
            │ Save ExecutionResult          │
            └───────────────────────────────┘
                                              ↓
                    Calculate total score
                                              ↓
                Update session.score in DB
                                              ↓
        Broadcast results to /topic/session/{id}/evaluation
                                              ↓
            Frontend displays test results
```

### 5. Chat Message Flow

```
User sends message → POST /api/chat
                                              ↓
                           ChatController
                                              ↓
                            ChatService
                                              ↓
                    Create Message entity
                                              ↓
                      Save to Database
                                              ↓
            Broadcast to /topic/session/{id}/chat
                                              ↓
             All participants receive message
                                              ↓
                Frontend appends to chat UI
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. HTTPS/TLS                                                │
│     └─ Encrypted transport layer                            │
│                                                               │
│  2. CORS                                                     │
│     └─ Restrict origins to known frontends                  │
│                                                               │
│  3. JWT Authentication                                       │
│     ├─ Stateless token-based auth                           │
│     ├─ 24-hour expiration                                    │
│     └─ Signed with HMAC-SHA256                               │
│                                                               │
│  4. Role-Based Access Control (RBAC)                         │
│     ├─ ADMIN: Full access                                    │
│     ├─ INTERVIEWER: Question mgmt, session control          │
│     └─ CANDIDATE: View assigned sessions only               │
│                                                               │
│  5. Method-Level Security                                    │
│     └─ @PreAuthorize annotations on controllers             │
│                                                               │
│  6. Input Validation                                         │
│     ├─ @Valid annotations                                    │
│     ├─ Size limits                                           │
│     └─ Type constraints                                      │
│                                                               │
│  7. SQL Injection Protection                                 │
│     └─ JPA parameterized queries                             │
│                                                               │
│  8. Password Security                                        │
│     └─ BCrypt hashing (cost factor 10)                       │
│                                                               │
│  9. Private Channels (WebSocket)                             │
│     └─ Interviewer-only notes via /topic/.../notes/private  │
│                                                               │
│ 10. Code Execution Sandboxing                                │
│     └─ Judge0 isolated Docker containers                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Strategy

### Current Architecture (Single Server)
- ✅ Good for: Development, testing, demos, small teams (<10 concurrent users)
- ❌ Limitations: Single point of failure, limited WebSocket connections

### Scaling to Medium (100-1000 concurrent users)

```
                    ┌──────────────────┐
                    │  Load Balancer   │
                    │ (Sticky Sessions)│
                    └────────┬─────────┘
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
     │  Backend 1  │  │ Backend 2  │  │ Backend 3  │
     └──────┬──────┘  └─────┬──────┘  └─────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ Redis Pub/Sub    │
                    │ (WebSocket Msgs) │
                    └──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   PostgreSQL     │
                    │ (Primary + Read  │
                    │    Replicas)     │
                    └──────────────────┘
```

**Changes Required:**
1. Replace in-memory message broker with Redis Pub/Sub
2. Add sticky sessions to load balancer (for WebSocket)
3. Configure database connection pooling
4. Add Redis caching layer for questions

### Scaling to Large (1000+ concurrent users)

```
CDN (Static Assets) ← Frontend Build
         │
    ┌────▼─────────┐
    │ API Gateway  │
    │  + WAF       │
    └────┬─────────┘
         │
    ┌────▼─────────────────────────┐
    │   Auto-scaling Group         │
    │  (10-50 Backend Instances)   │
    └────┬─────────────────────────┘
         │
    ┌────▼─────────┬──────────┬──────────┐
    │              │          │          │
┌───▼────┐  ┌─────▼───┐  ┌──▼──────┐  ┌▼─────────┐
│ Redis  │  │ Kafka/  │  │Database │  │  S3      │
│ Cache  │  │RabbitMQ │  │Cluster  │  │(Exports) │
└────────┘  └─────────┘  └─────────┘  └──────────┘
```

**Additional Changes:**
1. Use AWS/GCP managed services
2. Implement circuit breakers (Resilience4j)
3. Add distributed tracing (Zipkin/Jaeger)
4. Implement rate limiting per user
5. Add monitoring (Prometheus + Grafana)

---

## Technology Stack Summary

### Frontend
| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | React 19 | UI components |
| Language | TypeScript | Type safety |
| Build Tool | Vite 7 | Fast dev server & bundling |
| Styling | TailwindCSS 4 | Utility-first CSS |
| Code Editor | Monaco Editor | VS Code-like editing |
| WebSocket | STOMP.js + SockJS | Real-time communication |
| Router | React Router 7 | Client-side routing |
| Icons | Lucide React | Icon library |

### Backend
| Category | Technology | Purpose |
|----------|-----------|---------|
| Framework | Spring Boot 3.2 | Java framework |
| Language | Java 21 | Application logic |
| Security | Spring Security | Authentication & authorization |
| Auth | JWT (jjwt 0.12) | Stateless tokens |
| Database | PostgreSQL | Relational database |
| ORM | Hibernate (JPA) | Object-relational mapping |
| WebSocket | Spring WebSocket + STOMP | Real-time messaging |
| Validation | Hibernate Validator | Input validation |
| Email | Spring Mail | SMTP integration |

### Infrastructure
| Category | Technology | Purpose |
|----------|-----------|---------|
| Code Execution | Judge0 API | Sandboxed code running |
| Database | PostgreSQL 14+ | Primary data store |
| Caching (Future) | Redis | Session & data caching |
| Message Broker (Future) | Redis/RabbitMQ | Distributed WebSocket |
| Monitoring (Future) | Spring Actuator + Prometheus | Metrics collection |

---

## Design Patterns Used

1. **Repository Pattern** - Data access abstraction
2. **Service Layer Pattern** - Business logic separation
3. **DTO Pattern** - Data transfer objects for API
4. **Dependency Injection** - Spring IoC container
5. **Strategy Pattern** - Multiple code execution strategies
6. **Observer Pattern** - WebSocket event broadcasting
7. **Factory Pattern** - Entity creation
8. **Filter Chain Pattern** - JWT authentication filter

---

## Performance Optimization

### Database
- ✅ Indexes on foreign keys and frequently queried columns
- ✅ Lazy loading for relationships
- ✅ Connection pooling (HikariCP)
- 🔄 Query result caching (Redis - future)
- 🔄 Database read replicas (production)

### Application
- ✅ Stateless authentication (JWT)
- ✅ Debounced code updates (1 second)
- ✅ WebSocket for real-time (avoid polling)
- 🔄 Redis caching for questions
- 🔄 Async processing for heavy operations

### Frontend
- ✅ Code splitting (Vite)
- ✅ Lazy loading routes
- ✅ Optimistic UI updates
- 🔄 Service Worker (PWA - future)
- 🔄 CDN for static assets

---

## Future Enhancements

1. **Video/Audio Integration** - WebRTC or Daily.co embed
2. **Code Playback** - Timeline scrubbing through code history
3. **AI Code Review** - GPT-4 integration for hints
4. **Plagiarism Detection** - Compare with known solutions
5. **Analytics Dashboard** - Performance metrics, pass rates
6. **Mobile App** - React Native version
7. **IDE Integration** - VS Code extension
8. **Whiteboard** - Collaborative diagramming
9. **Screen Sharing** - For system design questions
10. **Recording** - Video recording of interviews

---

**Architecture Version:** 1.0
**Last Updated:** December 2, 2025
**Status:** Production-ready backend, frontend in development
