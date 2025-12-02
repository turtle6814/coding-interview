package com.codinginterview.platform.service;

import com.codinginterview.platform.domain.InterviewSession;
import com.codinginterview.platform.domain.Question;
import com.codinginterview.platform.domain.User;
import com.codinginterview.platform.repository.InterviewSessionRepository;
import com.codinginterview.platform.repository.QuestionRepository;
import com.codinginterview.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewSessionService {
    
    private final InterviewSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public InterviewSession createInterviewSession(
            String questionId,
            String candidateId,
            String interviewerId,
            Integer timerDuration) {
        
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        
        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new RuntimeException("Interviewer not found"));
        
        InterviewSession session = new InterviewSession();
        session.setId(UUID.randomUUID().toString());
        session.setQuestion(question);
        session.setCandidate(candidate);
        session.setInterviewer(interviewer);
        session.setLanguage("javascript");
        session.setCode(question.getStarterCode() != null ? question.getStarterCode() : "");
        session.setStatus(InterviewSession.SessionStatus.SCHEDULED);
        session.setTimerDuration(timerDuration);
        session.setTimerRemaining(timerDuration * 60); // Convert to seconds
        
        return sessionRepository.save(session);
    }
    
    public Optional<InterviewSession> getSessionById(String id) {
        return sessionRepository.findById(id);
    }
    
    public List<InterviewSession> getSessionsByCandidate(String candidateId) {
        return sessionRepository.findByCandidateId(candidateId);
    }
    
    public List<InterviewSession> getSessionsByInterviewer(String interviewerId) {
        return sessionRepository.findByInterviewerId(interviewerId);
    }
    
    @Transactional
    public InterviewSession startSession(String sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setStatus(InterviewSession.SessionStatus.ACTIVE);
        session.setActualStartTime(LocalDateTime.now());
        
        InterviewSession updated = sessionRepository.save(session);
        
        // Broadcast session start
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/status",
                Map.of("status", "ACTIVE", "startTime", updated.getActualStartTime())
        );
        
        return updated;
    }
    
    @Transactional
    public InterviewSession endSession(String sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setStatus(InterviewSession.SessionStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());
        
        InterviewSession updated = sessionRepository.save(session);
        
        // Broadcast session end
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/status",
                Map.of("status", "COMPLETED", "endTime", updated.getEndTime())
        );
        
        return updated;
    }
    
    @Transactional
    public InterviewSession updateCode(String sessionId, String code, String language) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setCode(code);
        if (language != null) {
            session.setLanguage(language);
        }
        
        return sessionRepository.save(session);
    }
    
    @Transactional
    public InterviewSession startTimer(String sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setTimerStatus(InterviewSession.TimerStatus.RUNNING);
        InterviewSession updated = sessionRepository.save(session);
        
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/timer",
                Map.of("action", "start", "remaining", session.getTimerRemaining())
        );
        
        return updated;
    }
    
    @Transactional
    public InterviewSession pauseTimer(String sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setTimerStatus(InterviewSession.TimerStatus.PAUSED);
        InterviewSession updated = sessionRepository.save(session);
        
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/timer",
                Map.of("action", "pause", "remaining", session.getTimerRemaining())
        );
        
        return updated;
    }
    
    @Transactional
    public InterviewSession updateTimerRemaining(String sessionId, Integer seconds) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setTimerRemaining(seconds);
        
        if (seconds <= 0) {
            session.setTimerStatus(InterviewSession.TimerStatus.EXPIRED);
        }
        
        return sessionRepository.save(session);
    }
    
    @Transactional
    public InterviewSession addFeedback(String sessionId, String feedback, Integer rating) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setInterviewerFeedback(feedback);
        session.setRating(rating);
        session.setStatus(InterviewSession.SessionStatus.REVIEWED);
        
        return sessionRepository.save(session);
    }
}
