package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.CodeUpdateMessage;
import com.codinginterview.platform.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class CollaborationController {
    private final SessionService sessionService;

    @MessageMapping("/session/{id}/code")
    @SendTo("/topic/session/{id}")
    public CodeUpdateMessage updateCode(@DestinationVariable String id, CodeUpdateMessage message) {
        sessionService.updateCode(id, message.getContent());
        return message;
    }
}
