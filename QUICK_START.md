# Quick Start Guide - Interview Session Features

## Overview

This guide helps developers understand and use the newly implemented real-time interview session features.

## Features at a Glance

✅ **4 Custom Hooks** - Reusable WebSocket-powered state management  
✅ **6 UI Components** - Polished, production-ready React components  
✅ **3 Session Pages** - Role-based interview experiences  
✅ **Real-time Updates** - WebSocket synchronization across all participants  
✅ **TypeScript** - Fully typed with comprehensive interfaces  

## Getting Started

### 1. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### 2. Access the Interview Session Pages

#### For Interviewers:
```
http://localhost:3000/interview-session/{sessionId}
```

**Features:**
- Full control panel with timer start/pause
- Auto-grading with test execution
- Private and public notes
- Real-time chat
- Question panel + code editor

#### For Candidates:
```
http://localhost:3000/candidate-session/{sessionId}
```

**Features:**
- Read-only timer display
- Code editor with execution
- Chat with interviewer (no grading or private notes)
- Question panel

#### Post-Interview Review:
```
http://localhost:3000/session-review/{sessionId}
```

**Features:**
- Code snapshot (read-only)
- Test results review
- Full notes timeline
- Complete chat history
- Interviewer feedback form
- Export to JSON/PDF

### 3. Using the Custom Hooks

#### useTimer Hook

```typescript
import { useTimer } from '../hooks/useTimer';

const { timeRemaining, timerStatus, timerDuration, startTimer, pauseTimer } = useTimer(sessionId);

// timeRemaining: number (seconds)
// timerStatus: 'RUNNING' | 'PAUSED' | 'EXPIRED'
// timerDuration: number (total seconds)
// startTimer: () => Promise<void>
// pauseTimer: () => Promise<void>
```

#### useGrading Hook

```typescript
import { useGrading } from '../hooks/useGrading';

const { evaluationResult, isEvaluating, error, evaluateCode, refreshResults } = useGrading(sessionId);

// evaluationResult: EvaluationResult | null
// isEvaluating: boolean
// error: string | null
// evaluateCode: () => Promise<void>
// refreshResults: () => Promise<void>
```

#### useNotes Hook

```typescript
import { useNotes } from '../hooks/useNotes';

const { notes, loading, error, addNote, refreshNotes } = useNotes(sessionId, userId, isInterviewer);

// notes: Note[]
// loading: boolean
// error: string | null
// addNote: (content: string, isPrivate: boolean, codeSnapshot?: string) => Promise<void>
// refreshNotes: () => Promise<void>
```

#### useChat Hook

```typescript
import { useChat } from '../hooks/useChat';

const { messages, loading, error, sendChatMessage, refreshMessages } = useChat(sessionId, userId);

// messages: Message[]
// loading: boolean
// error: string | null
// sendChatMessage: (content: string) => Promise<void>
// refreshMessages: () => Promise<void>
```

### 4. Using the Components

#### TimerDisplay

```tsx
import TimerDisplay from '../components/TimerDisplay';

<TimerDisplay
  timeRemaining={3600}     // 60 minutes in seconds
  timerStatus="RUNNING"    // or 'PAUSED' | 'EXPIRED'
  timerDuration={3600}
  onStart={() => startTimer()}    // Optional: interviewer only
  onPause={() => pauseTimer()}    // Optional: interviewer only
  showControls={true}      // Show start/pause buttons
/>
```

#### GradingPanel

```tsx
import GradingPanel from '../components/GradingPanel';

<GradingPanel
  evaluationResult={result}        // EvaluationResult | null
  isEvaluating={false}
  error={null}
  onEvaluate={async () => await evaluateCode()}
  showEvaluateButton={true}
/>
```

#### NotesPanel

```tsx
import NotesPanel from '../components/NotesPanel';

<NotesPanel
  notes={notes}
  currentUserId={userId}
  isInterviewer={true}
  onAddNote={async (content, isPrivate) => await addNote(content, isPrivate)}
  loading={false}
/>
```

#### ChatPanel

```tsx
import ChatPanel from '../components/ChatPanel';

<ChatPanel
  messages={messages}
  loading={false}
  onSendMessage={async (content) => await sendMessage(content)}
  currentUserId={userId}
/>
```

#### QuestionPanel

```tsx
import QuestionPanel from '../components/QuestionPanel';

<QuestionPanel
  question={{
    id: 1,
    title: "Two Sum Problem",
    description: "Given an array...",
    difficulty: "Medium",
    sampleInput: "Input: [2,7,11,15], target = 9",
    sampleOutput: "Output: [0,1]",
    hints: ["Use a hash map", "Think about O(n) time"],
    starterCode: { javascript: "function twoSum() {}" }
  }}
/>
```

#### TestCaseResults

```tsx
import TestCaseResults from '../components/TestCaseResults';

<TestCaseResults
  results={[
    {
      id: 1,
      input: "[2,7,11,15], 9",
      expectedOutput: "[0,1]",
      actualOutput: "[0,1]",
      passed: true,
      status: "ACCEPTED",
      executionTime: 45,
      memoryUsed: 2048,
      isHidden: false
    }
  ]}
/>
```

## WebSocket Integration

### Connection Setup

All hooks automatically manage WebSocket connections using SockJS + STOMP:

```typescript
// Automatic in hooks
const socket = new SockJS('http://localhost:8080/ws');
const client = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});
```

### Subscription Channels

Each session has dedicated channels:

- `/topic/session/{id}/timer` - Timer updates (1/sec)
- `/topic/session/{id}/evaluation` - Test results
- `/topic/session/{id}/notes` - Public notes
- `/topic/session/{id}/notes/private` - Private notes (interviewer only)
- `/topic/session/{id}/chat` - Chat messages
- `/topic/collaboration/session/{id}` - Code changes (existing)

## API Integration

### Required Backend Endpoints

Ensure these endpoints are implemented in your backend:

**Timer:**
- `POST /api/interview-sessions/{id}/timer/start`
- `POST /api/interview-sessions/{id}/timer/pause`

**Evaluation:**
- `POST /api/evaluation/session/{id}` (triggers async evaluation)
- `GET /api/evaluation/session/{id}/results`

**Notes:**
- `POST /api/notes`
- `GET /api/notes/session/{id}?includePrivate={boolean}`

**Chat:**
- `POST /api/chat`
- `GET /api/chat/session/{id}`

See `BACKEND_TODO.md` for complete backend implementation guide.

## Authentication

### Current Mock Setup

```typescript
// In session pages
const userId = 1; // Mock interviewer ID
const userId = 2; // Mock candidate ID
```

### Production Integration

Replace with actual auth context:

```typescript
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
const userId = user.id;
const userName = user.name;
const isInterviewer = user.role === 'INTERVIEWER';
```

## Routing

### Protected Routes

Routes are already configured in `App.tsx`:

```tsx
// Interviewer only
<Route path="/interview-session/:id" element={
  <ProtectedRoute requiredRole="INTERVIEWER">
    <InterviewerSessionPage />
  </ProtectedRoute>
} />

// Candidate only  
<Route path="/candidate-session/:id" element={
  <ProtectedRoute requiredRole="CANDIDATE">
    <CandidateSessionPage />
  </ProtectedRoute>
} />

// Both roles
<Route path="/session-review/:id" element={
  <ProtectedRoute>
    <SessionReviewPage />
  </ProtectedRoute>
} />
```

## Common Tasks

### Add a New Real-time Feature

1. **Create Custom Hook** (`hooks/useFeature.ts`)
   - Set up WebSocket connection
   - Subscribe to channel
   - Provide state and actions

2. **Create Component** (`components/FeaturePanel.tsx`)
   - Accept hook data as props
   - Render UI
   - Emit user actions

3. **Integrate in Session Page**
   - Import hook and component
   - Pass data between them
   - Add to tab or panel

### Customize Timer Behavior

Edit `hooks/useTimer.ts`:

```typescript
// Change warning threshold
const WARNING_THRESHOLD = 300; // 5 minutes

// Add custom timer event
useEffect(() => {
  if (timeRemaining === 60) {
    // Alert when 1 minute left
    alert('1 minute remaining!');
  }
}, [timeRemaining]);
```

### Add New Test Result Fields

1. Update `TestResult` interface in `hooks/useGrading.ts`
2. Update `TestCaseResults` component to display new fields
3. Ensure backend sends new fields in evaluation response

## Debugging

### WebSocket Connection Issues

Check browser console for:
```
✅ Chat WebSocket connected
✅ Timer WebSocket connected
✅ Grading WebSocket connected
```

If not connected:
1. Verify backend WebSocket endpoint: `http://localhost:8080/ws`
2. Check CORS configuration
3. Ensure SockJS fallback is enabled

### Component Not Updating

1. Check WebSocket subscription channel matches backend broadcast
2. Verify state updates in hook (add console.log)
3. Check component receives updated props

### Type Errors

Run type check:
```bash
npm run build
```

Common fixes:
- Ensure API function signatures match hook expectations
- Check interface definitions in `services/api.ts`
- Verify component props match interface

## Performance Tips

1. **Debounce Frequent Updates**
   ```typescript
   const debouncedSave = debounce(saveCode, 1000);
   ```

2. **Memoize Expensive Calculations**
   ```typescript
   const score = useMemo(() => calculateScore(results), [results]);
   ```

3. **Lazy Load Heavy Components**
   ```typescript
   const CodeEditor = lazy(() => import('../components/CodeEditor'));
   ```

## Troubleshooting

### Issue: Timer not starting
**Solution:** Check backend has `TimerService` with scheduled task broadcasting updates

### Issue: Grading panel shows no results
**Solution:** Verify backend `EvaluationService` broadcasts to `/topic/session/{id}/evaluation`

### Issue: Private notes visible to candidate
**Solution:** Check `isInterviewer` prop is correctly set and backend filters notes by role

### Issue: Chat messages duplicated
**Solution:** Deduplication already implemented - check message IDs are unique from backend

## Resources

- **Architecture Diagram**: `SESSION_ARCHITECTURE.md`
- **Implementation Summary**: `INTERVIEW_SESSION_FEATURES.md`
- **Backend Guide**: `BACKEND_TODO.md`
- **Main Documentation**: `README.md`

## Support

For issues or questions:
1. Check existing documentation files
2. Review component prop interfaces
3. Inspect browser console for WebSocket logs
4. Test backend endpoints with Postman/cURL

---

**Version**: 1.0.0  
**Last Updated**: Current session  
**Status**: ✅ All features complete and building successfully
