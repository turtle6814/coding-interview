package com.codinginterview.platform.controller;

import com.codinginterview.platform.model.Session;
import com.codinginterview.platform.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody(required = false) Map<String, String> request) {
        String language = request != null ? request.getOrDefault("language", "javascript") : "javascript";
        String code = request != null ? request.getOrDefault("code", "// Start coding...") : "// Start coding...";
        Session session = sessionService.createSession(language, code);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable String id) {
        Session session = sessionService.getSession(id);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(session);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Session> updateSession(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String code = request.get("code");
        Session session = sessionService.updateSessionCode(id, code);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

}
