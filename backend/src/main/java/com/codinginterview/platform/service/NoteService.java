package com.codinginterview.platform.service;

import com.codinginterview.platform.domain.Note;
import com.codinginterview.platform.domain.User;
import com.codinginterview.platform.repository.NoteRepository;
import com.codinginterview.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {
    
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public Note createNote(String sessionId, String authorId, String content, Boolean isPrivate, String codeSnapshot, Integer lineNumber, Note.NoteType type) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Note note = new Note();
        note.setSessionId(sessionId);
        note.setAuthor(author);
        note.setContent(content);
        note.setIsPrivate(isPrivate != null ? isPrivate : false);
        note.setCodeSnapshot(codeSnapshot);
        note.setLineNumber(lineNumber);
        note.setType(type != null ? type : Note.NoteType.GENERAL);
        
        Note savedNote = noteRepository.save(note);
        
        // Broadcast note to appropriate channel
        if (savedNote.getIsPrivate()) {
            // Send only to interviewer
            messagingTemplate.convertAndSend(
                    "/topic/session/" + sessionId + "/notes/private",
                    savedNote
            );
        } else {
            // Send to all participants
            messagingTemplate.convertAndSend(
                    "/topic/session/" + sessionId + "/notes",
                    savedNote
            );
        }
        
        return savedNote;
    }
    
    public List<Note> getSessionNotes(String sessionId, boolean includePrivate) {
        if (includePrivate) {
            return noteRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        } else {
            return noteRepository.findBySessionIdAndIsPrivate(sessionId, false);
        }
    }
    
    @Transactional
    public void deleteNote(String noteId) {
        noteRepository.deleteById(noteId);
    }
}
