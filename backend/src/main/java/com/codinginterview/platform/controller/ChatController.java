package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.Message;
import com.codinginterview.platform.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> payload) {
        String sessionId = (String) payload.get("sessionId");
        String senderId = (String) payload.get("senderId");
        String content = (String) payload.get("content");
        String typeStr = (String) payload.getOrDefault("type", "TEXT");
        
        Message.MessageType type = Message.MessageType.valueOf(typeStr);
        
        Message message = chatService.sendMessage(sessionId, senderId, content, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
    
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Message>> getSessionMessages(@PathVariable String sessionId) {
        List<Message> messages = chatService.getSessionMessages(sessionId);
        return ResponseEntity.ok(messages);
    }
}
