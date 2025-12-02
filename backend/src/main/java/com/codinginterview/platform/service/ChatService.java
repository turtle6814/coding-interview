package com.codinginterview.platform.service;

import com.codinginterview.platform.domain.Message;
import com.codinginterview.platform.domain.User;
import com.codinginterview.platform.repository.MessageRepository;
import com.codinginterview.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public Message sendMessage(String sessionId, String senderId, String content, Message.MessageType type) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Message message = new Message();
        message.setSessionId(sessionId);
        message.setSender(sender);
        message.setContent(content);
        message.setType(type != null ? type : Message.MessageType.TEXT);
        
        Message savedMessage = messageRepository.save(message);
        
        // Broadcast message via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/chat",
                savedMessage
        );
        
        return savedMessage;
    }
    
    public List<Message> getSessionMessages(String sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
}
