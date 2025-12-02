package com.codinginterview.platform.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSession {
    @Id
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    private User candidate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interviewer_id")
    private User interviewer;
    
    @Column(nullable = false)
    private String language;
    
    @Column(columnDefinition = "TEXT")
    private String code;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.SCHEDULED;
    
    private LocalDateTime scheduledStartTime;
    
    private LocalDateTime actualStartTime;
    
    private LocalDateTime endTime;
    
    private Integer timerDuration; // in minutes
    
    private Integer timerRemaining; // in seconds
    
    @Enumerated(EnumType.STRING)
    private TimerStatus timerStatus = TimerStatus.NOT_STARTED;
    
    @Column(columnDefinition = "TEXT")
    private String interviewerFeedback;
    
    private Integer rating; // 1-5
    
    private Double score; // percentage
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum SessionStatus {
        SCHEDULED,
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED,
        REVIEWED
    }
    
    public enum TimerStatus {
        NOT_STARTED,
        RUNNING,
        PAUSED,
        EXPIRED
    }
}
