package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.InterviewSession;
import com.codinginterview.platform.dto.CreateInterviewSessionRequest;
import com.codinginterview.platform.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview-sessions")
@RequiredArgsConstructor
public class InterviewSessionController {
    
    private final InterviewSessionService sessionService;
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<InterviewSession> createSession(
            @Valid @RequestBody CreateInterviewSessionRequest request) {
        
        InterviewSession session = sessionService.createInterviewSession(
                request.getQuestionId(),
                request.getCandidateId(),
                request.getInterviewerId(),
                request.getTimerDuration()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InterviewSession> getSession(@PathVariable String id) {
        return sessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/candidate/{candidateId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InterviewSession>> getSessionsByCandidate(@PathVariable String candidateId) {
        List<InterviewSession> sessions = sessionService.getSessionsByCandidate(candidateId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/interviewer/{interviewerId}")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<List<InterviewSession>> getSessionsByInterviewer(@PathVariable String interviewerId) {
        List<InterviewSession> sessions = sessionService.getSessionsByInterviewer(interviewerId);
        return ResponseEntity.ok(sessions);
    }
    
    @PutMapping("/{id}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InterviewSession> startSession(@PathVariable String id) {
        InterviewSession session = sessionService.startSession(id);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{id}/end")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InterviewSession> endSession(@PathVariable String id) {
        InterviewSession session = sessionService.endSession(id);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{id}/timer/start")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<InterviewSession> startTimer(@PathVariable String id) {
        InterviewSession session = sessionService.startTimer(id);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{id}/timer/pause")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<InterviewSession> pauseTimer(@PathVariable String id) {
        InterviewSession session = sessionService.pauseTimer(id);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{id}/timer")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<InterviewSession> updateTimer(
            @PathVariable String id,
            @RequestBody Map<String, Integer> payload) {
        
        Integer seconds = payload.get("seconds");
        InterviewSession session = sessionService.updateTimerRemaining(id, seconds);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{id}/feedback")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<InterviewSession> addFeedback(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        
        String feedback = (String) payload.get("feedback");
        Integer rating = (Integer) payload.get("rating");
        
        InterviewSession session = sessionService.addFeedback(id, feedback, rating);
        return ResponseEntity.ok(session);
    }
}
