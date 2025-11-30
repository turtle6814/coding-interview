package com.codinginterview.platform.service;

import com.codinginterview.platform.domain.Session;
import com.codinginterview.platform.domain.User;
import com.codinginterview.platform.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;

    public Session createSession() {
        String id = UUID.randomUUID().toString();
        Session session = new Session(id, "javascript", "// Start coding...");
        return sessionRepository.save(session);
    }

    public Session getSession(String id) {
        return sessionRepository.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public Session updateCode(String sessionId, String code) {
        Session session = getSession(sessionId);
        session.setCode(code);
        return sessionRepository.save(session);
    }

    public Session addUser(String sessionId, String username) {
        Session session = getSession(sessionId);
        User user = new User(UUID.randomUUID().toString(), username);
        session.getUsers().add(user);
        return sessionRepository.save(session);
    }
}
