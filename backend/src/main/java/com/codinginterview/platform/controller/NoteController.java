package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.Note;
import com.codinginterview.platform.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {
    
    private final NoteService noteService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Note> createNote(
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {
        
        String sessionId = (String) payload.get("sessionId");
        String content = (String) payload.get("content");
        Boolean isPrivate = (Boolean) payload.getOrDefault("isPrivate", false);
        String codeSnapshot = (String) payload.get("codeSnapshot");
        Integer lineNumber = (Integer) payload.get("lineNumber");
        String typeStr = (String) payload.getOrDefault("type", "GENERAL");
        
        // Get user ID from authentication
        String authorId = (String) payload.get("authorId");
        
        Note.NoteType type = Note.NoteType.valueOf(typeStr);
        
        Note note = noteService.createNote(sessionId, authorId, content, isPrivate, codeSnapshot, lineNumber, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }
    
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Note>> getSessionNotes(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "false") boolean includePrivate,
            Authentication authentication) {
        
        // Only interviewers can see private notes
        boolean canSeePrivate = includePrivate && hasInterviewerRole(authentication);
        
        List<Note> notes = noteService.getSessionNotes(sessionId, canSeePrivate);
        return ResponseEntity.ok(notes);
    }
    
    @DeleteMapping("/{noteId}")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<Void> deleteNote(@PathVariable String noteId) {
        noteService.deleteNote(noteId);
        return ResponseEntity.noContent().build();
    }
    
    private boolean hasInterviewerRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("INTERVIEWER") || a.getAuthority().equals("ADMIN"));
    }
}
