package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findBySessionId(String sessionId);
    List<Note> findBySessionIdAndIsPrivate(String sessionId, Boolean isPrivate);
    List<Note> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
