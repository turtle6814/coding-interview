# Component Architecture - Interview Session

## Page Hierarchy

```
App.tsx
├── /interview-session/:id → InterviewerSessionPage
│   ├── Header
│   │   ├── TimerDisplay (with controls)
│   │   ├── LanguageSelector
│   │   └── Run Code Button
│   ├── Left Panel (QuestionPanel)
│   ├── Center Panel
│   │   ├── CodeEditor (Monaco)
│   │   └── Console Output
│   └── Right Panel (Tabbed)
│       ├── GradingPanel
│       │   └── TestCaseResults
│       ├── NotesPanel
│       └── ChatPanel
│
├── /candidate-session/:id → CandidateSessionPage
│   ├── Header
│   │   ├── TimerDisplay (read-only)
│   │   ├── LanguageSelector
│   │   └── Run Code + Chat Toggle
│   ├── Left Panel (QuestionPanel)
│   ├── Right Panel
│   │   ├── CodeEditor (Monaco)
│   │   └── Console Output
│   └── Chat Overlay (floating)
│       └── ChatPanel
│
└── /session-review/:id → SessionReviewPage
    ├── Header (Summary Stats)
    ├── Left Sidebar (Navigation)
    ├── Main Content (Tabs)
    │   ├── CodeEditor (read-only)
    │   ├── TestCaseResults
    │   ├── Notes Timeline
    │   └── Chat History
    └── Right Panel (Feedback Form)
```

## Hook Usage Map

```
InterviewerSessionPage
├── useTimer → TimerDisplay
├── useGrading → GradingPanel
├── useNotes → NotesPanel
├── useChat → ChatPanel
└── useCollaboration → CodeEditor

CandidateSessionPage
├── useTimer → TimerDisplay
├── useChat → ChatPanel
└── useCollaboration → CodeEditor

SessionReviewPage
└── Direct API calls (no hooks)
    ├── getSession
    ├── getSessionResults → TestCaseResults
    ├── getSessionNotes
    └── getSessionMessages
```

## WebSocket Channels

```
Session ID: 123

Real-time Updates:
├── /topic/session/123/timer
│   └── useTimer hook subscribes
│       └── TimerDisplay updates
│
├── /topic/session/123/evaluation
│   └── useGrading hook subscribes
│       └── GradingPanel updates
│
├── /topic/session/123/notes
│   └── useNotes hook subscribes (public)
│       └── NotesPanel updates
│
├── /topic/session/123/notes/private
│   └── useNotes hook subscribes (interviewer only)
│       └── NotesPanel updates
│
├── /topic/session/123/chat
│   └── useChat hook subscribes
│       └── ChatPanel updates
│
└── /topic/collaboration/session/123
    └── useCollaboration hook subscribes
        └── CodeEditor updates
```

## Data Flow Examples

### Interviewer Evaluates Code

```
1. User clicks "Run Tests" button in GradingPanel
   ↓
2. handleRunTests() → triggerEvaluation()
   ↓
3. useGrading hook → evaluateCode()
   ↓
4. API call: POST /evaluation/session/{id}
   ↓
5. Backend executes tests via Judge0
   ↓
6. Backend broadcasts result via WebSocket
   ↓
7. useGrading subscribes to /topic/session/{id}/evaluation
   ↓
8. Hook updates evaluationResult state
   ↓
9. GradingPanel re-renders with new results
   ↓
10. TestCaseResults displays pass/fail details
```

### Real-time Chat Flow

```
Interviewer sends message:
1. User types in ChatPanel input
   ↓
2. handleSendMessage() → sendChatMessage()
   ↓
3. useChat hook → POST /api/chat
   ↓
4. Backend saves message
   ↓
5. Backend broadcasts via /topic/session/{id}/chat
   ↓
6. Both interviewer & candidate useChat hooks receive
   ↓
7. Messages state updated (with deduplication)
   ↓
8. ChatPanel re-renders with new message
```

### Timer Synchronization

```
Interviewer starts timer:
1. TimerDisplay "Start" button clicked
   ↓
2. onStart() → startTimer()
   ↓
3. useTimer hook → POST /api/interview-sessions/{id}/timer/start
   ↓
4. Backend updates timer state
   ↓
5. Backend broadcasts via /topic/session/{id}/timer
   ↓
6. Both useTimer hooks (interviewer + candidate) receive update
   ↓
7. TimerDisplay updates countdown display
   ↓
8. Every second, backend broadcasts remaining time
   ↓
9. When time expires, status changes to EXPIRED (red)
```

## Component Props Interface

```typescript
// TimerDisplay
interface Props {
  timeRemaining: number;     // seconds remaining
  timerStatus: string;       // RUNNING | PAUSED | EXPIRED
  timerDuration: number;     // total duration in seconds
  onStart?: () => void;      // interviewer only
  onPause?: () => void;      // interviewer only
  showControls: boolean;     // true for interviewer
}

// GradingPanel
interface Props {
  evaluationResult: EvaluationResult | null;
  isEvaluating: boolean;
  error: string | null;
  onEvaluate: () => Promise<void>;
  showEvaluateButton?: boolean;
}

// NotesPanel
interface Props {
  notes: Note[];
  currentUserId: number;
  isInterviewer: boolean;
  onAddNote: (content: string, isPrivate: boolean) => Promise<void>;
  loading?: boolean;
}

// ChatPanel
interface Props {
  messages: Message[];
  loading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  currentUserId: number;
}
```

## State Management Strategy

```
Local Component State (useState)
├── UI-only state (modals, tabs, toggles)
├── Form inputs (textarea, checkbox values)
└── Derived display state (formatted times, colors)

Custom Hook State
├── Server-synced data (messages, notes, results)
├── Loading/error states
├── WebSocket connection status
└── Real-time updates from backend

Context (Future)
├── Authentication state (userId, role, token)
├── Session metadata (questionId, participants)
└── Global notifications/alerts
```

## Routing Strategy

```
Public Routes:
├── /login
└── /register

Protected Routes (any role):
├── /
└── /session-review/:id

Interviewer-Only Routes:
├── /questions (question bank)
├── /setup-interview (create session)
└── /interview-session/:id (full control)

Candidate-Only Routes:
└── /candidate-session/:id (restricted view)

Legacy Route (backward compatible):
└── /session/:id → EditorPage (simple collaboration)
```

---

**Legend:**
- `→` indicates navigation/flow
- `├──` indicates parent-child relationship
- `↓` indicates sequential steps
