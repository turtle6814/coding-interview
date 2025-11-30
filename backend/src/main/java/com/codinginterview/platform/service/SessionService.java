package com.codinginterview.platform.service;

import com.codinginterview.platform.model.Session;
import com.codinginterview.platform.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    public Session createSession(String language, String code) {
        Session session = new Session();
        session.setId(UUID.randomUUID().toString());
        session.setLanguage(language);
        session.setCode(code);
        return sessionRepository.save(session);
    }

    public Session getSession(String id) {
        return sessionRepository.findById(id).orElse(null);
    }

    public Session updateSessionCode(String id, String code) {
        Session session = sessionRepository.findById(id).orElse(null);
        if (session != null) {
            session.setCode(code);
            return sessionRepository.save(session);
        }
        return null;
    }

    public void deleteSession(String id) {
        sessionRepository.deleteById(id);
    }
}
