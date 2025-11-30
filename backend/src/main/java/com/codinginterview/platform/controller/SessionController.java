package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.Session;
import com.codinginterview.platform.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*") // Allow all origins for simplicity
@RequiredArgsConstructor
public class SessionController {
    private final SessionService sessionService;

    @PostMapping
    public Session createSession() {
        return sessionService.createSession();
    }

    @GetMapping("/{id}")
    public Session getSession(@PathVariable String id) {
        return sessionService.getSession(id);
    }
}
