package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, String> {
    List<InterviewSession> findByCandidateId(String candidateId);
    List<InterviewSession> findByInterviewerId(String interviewerId);
    List<InterviewSession> findByStatus(InterviewSession.SessionStatus status);
    List<InterviewSession> findByScheduledStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
