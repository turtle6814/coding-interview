package com.codinginterview.platform.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "code_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String sessionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;
    
    @Column(nullable = false)
    private String language;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChangeType changeType = ChangeType.EDIT;
    
    @Column(columnDefinition = "TEXT")
    private String changeDescription;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    public enum ChangeType {
        EDIT,
        EXECUTE,
        SAVE,
        LANGUAGE_CHANGE
    }
}
