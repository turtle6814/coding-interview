package com.codinginterview.platform.controller;

import com.codinginterview.platform.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class CollaborationController {

    @Autowired
    private SessionService sessionService;

    @MessageMapping("/session/{sessionId}/code")
    @SendTo("/topic/session/{sessionId}")
    public Map<String, Object> handleCodeUpdate(
            @DestinationVariable String sessionId,
            Map<String, Object> message) {
        
        // Update the session code using the correct method name
        String code = (String) message.get("code");
        sessionService.updateSessionCode(sessionId, code);
        
        // Broadcast to all subscribers
        return message;
    }
}
