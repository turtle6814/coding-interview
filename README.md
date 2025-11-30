# 🚀 Online Coding Interview Platform

A real-time collaborative coding interview platform built with **Spring Boot** and **React**.

## ✨ Features

- 🔗 **Unique Session Links** - Share interview sessions instantly
- 👥 **Real-Time Collaboration** - Multiple users can edit code simultaneously
- 🎨 **Monaco Editor** - Professional code editor with syntax highlighting
- ⚡ **Live Execution** - Run JavaScript code safely in the browser
- 🔄 **WebSocket Sync** - Instant updates across all connected users
- 🎯 **Multi-Language Support** - JavaScript, Python, Java, C++ syntax highlighting

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  React Frontend │◄───────►│  Spring Boot API │
│   (Vite + TS)   │ WebSocket│  (Java 21)      │
│                 │         │                  │
│  Monaco Editor  │         │  H2 Database     │
└─────────────────┘         └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+

### 1️⃣ Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### 2️⃣ Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3️⃣ Use the Platform
1. Open `http://localhost:5173`
2. Click "Start New Interview"
3. Share the session URL with others
4. Start coding together in real-time!

## 📚 Documentation

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Complete technical documentation
  - High-level architecture
  - API specifications
  - Database schema
  - Security considerations
  - Deployment guide

## 🛠️ Tech Stack

### Backend
- Spring Boot 3.2.3
- Spring WebSocket (STOMP)
- Spring Data JPA
- H2 Database
- Lombok

### Frontend
- React 19.2.0
- TypeScript
- Vite 7.2.4
- Monaco Editor
- Tailwind CSS
- STOMP.js + SockJS

## 🔒 Security Notes

⚠️ **This is a development/demo version**. For production:
- Enable authentication (JWT)
- Restrict CORS origins
- Use backend code execution with Docker sandboxing
- Implement rate limiting
- Add session expiration

See [ARCHITECTURE.md](./ARCHITECTURE.md#security-considerations) for details.

## 📦 Production Build

### Backend
```bash
cd backend
mvn clean package
java -jar target/platform-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Serve the 'dist' folder with nginx or any static server
```

## 🎯 Key Features Explained

### Real-Time Collaboration
Uses **STOMP over WebSocket** for bidirectional communication. When one user types, all connected users see the changes instantly.

### Code Execution
JavaScript code runs in a **Web Worker** sandbox for security. The worker captures `console.log` output and returns it to the UI.

### Session Management
Each session gets a unique UUID. Share the URL to invite others to collaborate.

## 🔮 Future Enhancements

- [ ] Multi-language execution (Python, Java, C++)
- [ ] Video/audio chat integration
- [ ] Question bank and templates
- [ ] Code playback and history
- [ ] Test case validation
- [ ] Interview analytics

## 📄 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

Contributions welcome! Please read the architecture documentation before submitting PRs.

---

**Built with ❤️ for better technical interviews**