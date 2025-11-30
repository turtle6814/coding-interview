# Sample Code & Usage Examples

## Quick Start

### 1. Start the Platform

```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### 2. Access the Application

Open your browser to: `http://localhost:5173`

---

## Sample Code to Test

### JavaScript Examples

#### Hello World
```javascript
console.log('Hello from CodeInterview!');
```

#### Array Operations
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Original:', numbers);
console.log('Doubled:', doubled);
```

#### FizzBuzz
```javascript
for (let i = 1; i <= 15; i++) {
    if (i % 15 === 0) console.log('FizzBuzz');
    else if (i % 3 === 0) console.log('Fizz');
    else if (i % 5 === 0) console.log('Buzz');
    else console.log(i);
}
```

#### Fibonacci
```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
    console.log(`fib(${i}) = ${fibonacci(i)}`);
}
```

#### Two Sum Problem
```javascript
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const result = twoSum([2, 7, 11, 15], 9);
console.log('Indices:', result);
```

---

## API Usage Examples

### Create a Session

```bash
curl -X POST http://localhost:8080/api/sessions
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "language": "javascript",
  "code": "// Start coding...",
  "users": []
}
```

### Get a Session

```bash
curl http://localhost:8080/api/sessions/550e8400-e29b-41d4-a716-446655440000
```

---

## WebSocket Testing

### Using JavaScript Console

```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected:', frame);
    
    // Subscribe to session updates
    stompClient.subscribe('/topic/session/YOUR_SESSION_ID', function(message) {
        console.log('Received:', JSON.parse(message.body));
    });
    
    // Send code update
    stompClient.send('/app/session/YOUR_SESSION_ID/code', {}, 
        JSON.stringify({ content: 'console.log("Hello");' })
    );
});
```

---

## Testing Real-Time Collaboration

### Steps to Test

1. **Create a session** by clicking "Start New Interview"
2. **Copy the URL** from the address bar
3. **Open the URL in a new tab** (or incognito window)
4. **Type in one tab** and watch it appear in the other tab instantly
5. **Click Run** to execute the code

### Expected Behavior

- ✅ Code typed in Tab 1 appears in Tab 2 within 100ms
- ✅ Code typed in Tab 2 appears in Tab 1 within 100ms
- ✅ Both tabs show the same output when Run is clicked
- ✅ Connection status shows "Connected" in green

---

## Common Interview Questions to Test

### 1. Reverse a String

```javascript
function reverseString(str) {
    return str.split('').reverse().join('');
}

console.log(reverseString('hello')); // 'olleh'
```

### 2. Palindrome Check

```javascript
function isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
```

### 3. Find Maximum in Array

```javascript
function findMax(arr) {
    return Math.max(...arr);
}

console.log(findMax([3, 7, 2, 9, 1])); // 9
```

### 4. Count Vowels

```javascript
function countVowels(str) {
    const matches = str.match(/[aeiou]/gi);
    return matches ? matches.length : 0;
}

console.log(countVowels('Hello World')); // 3
```

### 5. Binary Search

```javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

const sorted = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(sorted, 7)); // 3
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill the process if needed
kill -9 <PID>

# Restart backend
cd backend
mvn spring-boot:run
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

### WebSocket Connection Issues

1. Check backend is running on port 8080
2. Check browser console for errors
3. Verify CORS is enabled in backend
4. Try refreshing the page

---

## Performance Tips

### For Large Code Files

The platform handles code up to **10MB** efficiently. For larger files:
- Consider splitting into modules
- Use code compression
- Implement lazy loading

### For Many Concurrent Users

- Use a production database (PostgreSQL)
- Enable connection pooling
- Implement rate limiting
- Use Redis for session storage

---

## Security Best Practices

### Before Production Deployment

1. **Enable Authentication**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/**").authenticated()
        );
        return http.build();
    }
}
```

2. **Restrict CORS**
```java
@CrossOrigin(origins = "https://yourdomain.com")
```

3. **Add Rate Limiting**
```java
@RateLimiter(name = "sessionCreation", fallbackMethod = "rateLimitFallback")
public Session createSession() { ... }
```

4. **Implement Session Expiration**
```java
@Scheduled(fixedRate = 3600000) // 1 hour
public void cleanupExpiredSessions() {
    sessionRepository.deleteExpiredSessions();
}
```

---

## Extending the Platform

### Add Python Support

```bash
# Install Pyodide in frontend
npm install pyodide
```

```typescript
// Create Python executor
import { loadPyodide } from 'pyodide';

async function runPython(code: string) {
    const pyodide = await loadPyodide();
    return pyodide.runPython(code);
}
```

### Add Video Chat

```bash
npm install simple-peer
```

```typescript
// Implement WebRTC
import Peer from 'simple-peer';

const peer = new Peer({ initiator: true });
// ... WebRTC setup
```

---

## Useful Commands

### Development

```bash
# Backend hot reload (with spring-boot-devtools)
mvn spring-boot:run

# Frontend hot reload (automatic with Vite)
npm run dev

# Run tests
mvn test                    # Backend
npm test                    # Frontend
```

### Production

```bash
# Build backend
mvn clean package -DskipTests

# Build frontend
npm run build

# Run production backend
java -jar target/platform-0.0.1-SNAPSHOT.jar

# Serve production frontend
npx serve -s dist
```

---

## Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev
- **Monaco Editor**: https://microsoft.github.io/monaco-editor/
- **STOMP Protocol**: https://stomp.github.io/
- **Tailwind CSS**: https://tailwindcss.com/

---

**Happy Coding! 🚀**
