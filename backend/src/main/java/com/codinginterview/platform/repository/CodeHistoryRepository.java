package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.CodeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeHistoryRepository extends JpaRepository<CodeHistory, String> {
    List<CodeHistory> findBySessionIdOrderByTimestampAsc(String sessionId);
    List<CodeHistory> findBySessionIdAndChangeType(String sessionId, CodeHistory.ChangeType changeType);
}
