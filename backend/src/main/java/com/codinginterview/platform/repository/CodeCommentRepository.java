package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.CodeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeCommentRepository extends JpaRepository<CodeComment, String> {
    List<CodeComment> findBySessionId(String sessionId);
    List<CodeComment> findBySessionIdAndResolved(String sessionId, Boolean resolved);
}
