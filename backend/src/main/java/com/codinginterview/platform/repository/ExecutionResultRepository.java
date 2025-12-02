package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.ExecutionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExecutionResultRepository extends JpaRepository<ExecutionResult, String> {
    List<ExecutionResult> findBySessionId(String sessionId);
    List<ExecutionResult> findBySessionIdOrderByExecutedAtDesc(String sessionId);
}
