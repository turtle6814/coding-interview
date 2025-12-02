# Backend Implementation Checklist

This document outlines the backend work needed to support the newly implemented interview session features.

## 1. WebSocket Controllers & Messaging

### Required WebSocket Endpoints

#### TimerController
```java
@MessageMapping("/session/{sessionId}/timer/start")
@SendTo("/topic/session/{sessionId}/timer")
public TimerState startTimer(@DestinationVariable Long sessionId) {
    // Start session timer
    // Return TimerState { timeRemaining, status, duration }
}

@MessageMapping("/session/{sessionId}/timer/pause")
@SendTo("/topic/session/{sessionId}/timer")
public TimerState pauseTimer(@DestinationVariable Long sessionId) {
    // Pause session timer
    // Return TimerState
}

// Scheduled task to broadcast timer updates every second
@Scheduled(fixedRate = 1000)
public void broadcastTimerUpdates() {
    // For each active session with running timer:
    // messagingTemplate.convertAndSend("/topic/session/{id}/timer", timerState)
}
```

#### EvaluationController (WebSocket support)
```java
@MessageMapping("/session/{sessionId}/evaluate")
public void evaluateSession(@DestinationVariable Long sessionId, EvaluateRequest request) {
    // Trigger async evaluation
    evaluationService.evaluateAsync(sessionId, request.getCode(), request.getLanguage());
}

// In EvaluationService, after Judge0 execution:
public void broadcastResults(Long sessionId, EvaluationResult result) {
    messagingTemplate.convertAndSend(
        "/topic/session/" + sessionId + "/evaluation", 
        result
    );
}
```

#### NotesController (WebSocket support)
```java
@MessageMapping("/session/{sessionId}/notes/create")
public void createNote(@DestinationVariable Long sessionId, CreateNoteRequest request) {
    Note note = notesService.createNote(request);
    
    // Broadcast to public channel
    messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/notes", note);
    
    // If private, also broadcast to private channel
    if (note.isPrivate()) {
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/notes/private", note);
    }
}
```

#### ChatController (WebSocket support)
```java
@MessageMapping("/session/{sessionId}/chat/send")
@SendTo("/topic/session/{sessionId}/chat")
public ChatMessage sendMessage(@DestinationVariable Long sessionId, SendMessageRequest request) {
    // Save message to database
    ChatMessage message = chatService.saveMessage(request);
    return message; // Auto-broadcast to all subscribers
}
```

## 2. Domain Models

### TimerState
```java
@Data
public class TimerState {
    private Integer timeRemaining;  // seconds
    private String status;          // RUNNING, PAUSED, EXPIRED
    private Integer duration;       // total duration in seconds
}
```

### EvaluationResult
```java
@Data
public class EvaluationResult {
    private Long sessionId;
    private Integer totalTests;
    private Integer passedTests;
    private Integer failedTests;
    private Double score;           // percentage
    private List<TestResult> results;
    private LocalDateTime evaluatedAt;
}

@Data
public class TestResult {
    private Long id;
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private Boolean passed;
    private String status;          // ACCEPTED, WRONG_ANSWER, RUNTIME_ERROR, etc.
    private Integer executionTime;  // ms
    private Integer memoryUsed;     // KB
    private String errorMessage;
    private Boolean isHidden;
}
```

### Note
```java
@Entity
@Data
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long sessionId;
    private Long authorId;
    private String authorName;
    private String content;
    private Boolean isPrivate;
    
    @Column(columnDefinition = "TEXT")
    private String codeSnapshot;
    
    private Integer lineNumber;
    private String type;            // OBSERVATION, HINT, FEEDBACK
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### ChatMessage
```java
@Entity
@Data
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long sessionId;
    private Long senderId;
    private String senderName;
    private String content;
    private String type;            // TEXT, SYSTEM
    
    @CreationTimestamp
    private LocalDateTime timestamp;
}
```

## 3. Service Layer

### TimerService
```java
@Service
public class TimerService {
    
    // In-memory cache for active timers
    private Map<Long, TimerState> activeTimers = new ConcurrentHashMap<>();
    
    public TimerState startTimer(Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new NotFoundException("Session not found"));
        
        TimerState state = new TimerState();
        state.setDuration(session.getDurationMinutes() * 60);
        state.setTimeRemaining(state.getDuration());
        state.setStatus("RUNNING");
        
        activeTimers.put(sessionId, state);
        session.setTimerStartedAt(LocalDateTime.now());
        sessionRepository.save(session);
        
        return state;
    }
    
    public TimerState pauseTimer(Long sessionId) {
        TimerState state = activeTimers.get(sessionId);
        if (state != null) {
            state.setStatus("PAUSED");
        }
        return state;
    }
    
    @Scheduled(fixedRate = 1000) // Every second
    public void updateTimers() {
        activeTimers.forEach((sessionId, state) -> {
            if ("RUNNING".equals(state.getStatus())) {
                state.setTimeRemaining(state.getTimeRemaining() - 1);
                
                if (state.getTimeRemaining() <= 0) {
                    state.setStatus("EXPIRED");
                    state.setTimeRemaining(0);
                }
                
                // Broadcast update
                messagingTemplate.convertAndSend(
                    "/topic/session/" + sessionId + "/timer", 
                    state
                );
            }
        });
    }
}
```

### NotesService
```java
@Service
public class NotesService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Note createNote(CreateNoteRequest request) {
        User author = userRepository.findById(request.getAuthorId())
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        Note note = new Note();
        note.setSessionId(request.getSessionId());
        note.setAuthorId(request.getAuthorId());
        note.setAuthorName(author.getName());
        note.setContent(request.getContent());
        note.setIsPrivate(request.getIsPrivate());
        note.setCodeSnapshot(request.getCodeSnapshot());
        note.setLineNumber(request.getLineNumber());
        note.setType(request.getType());
        
        return noteRepository.save(note);
    }
    
    public List<Note> getSessionNotes(Long sessionId, boolean includePrivate, Long userId) {
        List<Note> notes = noteRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        
        if (!includePrivate) {
            // Filter out private notes not owned by user
            notes = notes.stream()
                .filter(note -> !note.getIsPrivate() || note.getAuthorId().equals(userId))
                .collect(Collectors.toList());
        }
        
        return notes;
    }
}
```

### ChatService
```java
@Service
public class ChatService {
    
    @Autowired
    private ChatMessageRepository chatRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public ChatMessage saveMessage(SendMessageRequest request) {
        User sender = userRepository.findById(request.getSenderId())
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        ChatMessage message = new ChatMessage();
        message.setSessionId(request.getSessionId());
        message.setSenderId(request.getSenderId());
        message.setSenderName(sender.getName());
        message.setContent(request.getContent());
        message.setType(request.getType() != null ? request.getType() : "TEXT");
        
        return chatRepository.save(message);
    }
    
    public List<ChatMessage> getSessionMessages(Long sessionId) {
        return chatRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }
}
```

### EvaluationService Enhancement
```java
@Service
public class EvaluationService {
    
    @Autowired
    private Judge0Service judge0Service;
    
    @Autowired
    private TestCaseRepository testCaseRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Async
    public void evaluateAsync(Long sessionId, String code, String language) {
        try {
            // Load test cases for this session's question
            List<TestCase> testCases = testCaseRepository.findByQuestionId(questionId);
            
            List<TestResult> results = new ArrayList<>();
            int passed = 0;
            
            for (TestCase testCase : testCases) {
                // Submit to Judge0
                Judge0Result judgeResult = judge0Service.execute(code, language, testCase.getInput());
                
                TestResult result = new TestResult();
                result.setInput(testCase.getInput());
                result.setExpectedOutput(testCase.getExpectedOutput());
                result.setActualOutput(judgeResult.getOutput());
                result.setPassed(judgeResult.getOutput().trim().equals(testCase.getExpectedOutput().trim()));
                result.setStatus(judgeResult.getStatus());
                result.setExecutionTime(judgeResult.getTime());
                result.setMemoryUsed(judgeResult.getMemory());
                result.setIsHidden(testCase.getIsHidden());
                
                if (result.getPassed()) passed++;
                results.add(result);
            }
            
            EvaluationResult evaluationResult = new EvaluationResult();
            evaluationResult.setSessionId(sessionId);
            evaluationResult.setTotalTests(testCases.size());
            evaluationResult.setPassedTests(passed);
            evaluationResult.setFailedTests(testCases.size() - passed);
            evaluationResult.setScore((double) passed / testCases.size() * 100);
            evaluationResult.setResults(results);
            evaluationResult.setEvaluatedAt(LocalDateTime.now());
            
            // Broadcast result via WebSocket
            messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/evaluation",
                evaluationResult
            );
            
        } catch (Exception e) {
            // Broadcast error
            ErrorMessage error = new ErrorMessage("Evaluation failed: " + e.getMessage());
            messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/evaluation",
                error
            );
        }
    }
}
```

## 4. Repository Interfaces

```java
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
    List<Note> findBySessionIdAndIsPrivate(Long sessionId, Boolean isPrivate);
}

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);
}

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByQuestionId(Long questionId);
}
```

## 5. REST API Endpoints (Fallback)

For clients without WebSocket support, provide REST endpoints:

```java
@RestController
@RequestMapping("/api")
public class SessionRestController {
    
    // Timer endpoints
    @PostMapping("/interview-sessions/{id}/timer/start")
    public ResponseEntity<TimerState> startTimer(@PathVariable Long id) { ... }
    
    @PostMapping("/interview-sessions/{id}/timer/pause")
    public ResponseEntity<TimerState> pauseTimer(@PathVariable Long id) { ... }
    
    @GetMapping("/interview-sessions/{id}/timer")
    public ResponseEntity<TimerState> getTimerState(@PathVariable Long id) { ... }
    
    // Evaluation endpoints  
    @PostMapping("/evaluation/session/{id}")
    public ResponseEntity<Void> evaluateSession(@PathVariable Long id, @RequestBody EvaluateRequest request) { ... }
    
    @GetMapping("/evaluation/session/{id}/results")
    public ResponseEntity<EvaluationResult> getResults(@PathVariable Long id) { ... }
    
    // Notes endpoints
    @PostMapping("/notes")
    public ResponseEntity<Note> createNote(@RequestBody CreateNoteRequest request) { ... }
    
    @GetMapping("/notes/session/{id}")
    public ResponseEntity<List<Note>> getSessionNotes(
        @PathVariable Long id,
        @RequestParam(defaultValue = "false") boolean includePrivate
    ) { ... }
    
    // Chat endpoints
    @PostMapping("/chat")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody SendMessageRequest request) { ... }
    
    @GetMapping("/chat/session/{id}")
    public ResponseEntity<List<ChatMessage>> getSessionMessages(@PathVariable Long id) { ... }
}
```

## 6. Database Migrations

### Create Notes Table
```sql
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    code_snapshot TEXT,
    line_number INTEGER,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_notes_session ON notes(session_id);
CREATE INDEX idx_notes_author ON notes(author_id);
```

### Create Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'TEXT',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_timestamp ON chat_messages(timestamp);
```

### Update Interview Sessions Table
```sql
ALTER TABLE interview_sessions
ADD COLUMN timer_started_at TIMESTAMP,
ADD COLUMN timer_paused_at TIMESTAMP,
ADD COLUMN timer_status VARCHAR(20) DEFAULT 'NOT_STARTED';
```

## 7. Security Considerations

### WebSocket Security
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Add authentication interceptor
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                // Validate JWT token from StompHeaderAccessor
                // Check user has access to session
                return message;
            }
        });
    }
}
```

### Session Access Control
```java
@Service
public class SessionSecurityService {
    
    public boolean canAccessSession(Long sessionId, Long userId) {
        InterviewSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new NotFoundException("Session not found"));
        
        return session.getInterviewerId().equals(userId) 
            || session.getCandidateId().equals(userId);
    }
    
    public boolean canViewPrivateNotes(Long sessionId, Long userId) {
        InterviewSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new NotFoundException("Session not found"));
        
        // Only interviewer can see private notes
        return session.getInterviewerId().equals(userId);
    }
}
```

## 8. Testing Checklist

### Unit Tests
- [ ] TimerService.startTimer()
- [ ] TimerService.pauseTimer()
- [ ] TimerService.updateTimers() (scheduled task)
- [ ] EvaluationService.evaluateAsync()
- [ ] NotesService.createNote()
- [ ] NotesService.getSessionNotes() (with privacy filtering)
- [ ] ChatService.saveMessage()

### Integration Tests
- [ ] WebSocket connection establishment
- [ ] Timer broadcast every second
- [ ] Evaluation result broadcast after Judge0 execution
- [ ] Notes broadcast to correct channels (public/private)
- [ ] Chat message broadcast to all session participants
- [ ] Authorization checks for WebSocket messages

### Load Tests
- [ ] Multiple concurrent sessions with timers
- [ ] High-frequency chat messaging
- [ ] Simultaneous code evaluations
- [ ] WebSocket connection limits

## 9. Configuration

### application.properties
```properties
# WebSocket
spring.websocket.max-sessions=1000
spring.websocket.max-text-message-size=65536

# Scheduling (for timer updates)
spring.task.scheduling.pool.size=5

# Async execution (for evaluations)
spring.task.execution.pool.core-size=10
spring.task.execution.pool.max-size=20
spring.task.execution.pool.queue-capacity=100

# Session timeout
session.inactive-timeout-minutes=60
```

## 10. Monitoring & Logging

```java
@Aspect
@Component
public class WebSocketMonitoringAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketMonitoringAspect.class);
    
    @Around("@annotation(org.springframework.messaging.handler.annotation.MessageMapping)")
    public Object logWebSocketMessage(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().getName();
        
        logger.info("WebSocket message received: {}", methodName);
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            logger.info("WebSocket message processed: {} ({}ms)", methodName, duration);
            return result;
        } catch (Exception e) {
            logger.error("WebSocket message failed: {}", methodName, e);
            throw e;
        }
    }
}
```

---

## Summary

**Total Backend Work:**
- 4 new WebSocket controllers (Timer, Enhanced Evaluation, Notes, Chat)
- 4 new domain models (TimerState, EvaluationResult, Note, ChatMessage)
- 4 new services (TimerService, NotesService, ChatService, Enhanced EvaluationService)
- 3 new repositories (NoteRepository, ChatMessageRepository, TestCaseRepository)
- 2 new database tables (notes, chat_messages)
- Security enhancements for WebSocket authentication
- Comprehensive testing suite

**Estimated Development Time**: 2-3 days for core features + 1-2 days for testing

**Priority Order**:
1. Database migrations (notes, chat_messages tables)
2. Domain models and repositories
3. Service layer implementation
4. WebSocket controllers and broadcasting
5. Security and authentication
6. Testing and monitoring
