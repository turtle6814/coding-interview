package com.codinginterview.platform.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_cases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String input;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String expectedOutput;
    
    @Column(nullable = false)
    private Boolean isHidden = false;
    
    @Column(nullable = false)
    private Integer points = 10;
    
    private Integer timeLimit; // in seconds
    
    private Integer memoryLimit; // in MB
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
