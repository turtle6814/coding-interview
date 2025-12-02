package com.codinginterview.platform.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "execution_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String sessionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id")
    private TestCase testCase;
    
    @Column(nullable = false)
    private Boolean passed;
    
    @Column(columnDefinition = "TEXT")
    private String actualOutput;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    private Integer executionTime; // in milliseconds
    
    private Double memoryUsed; // in MB
    
    private Integer exitCode;
    
    @Column(columnDefinition = "TEXT")
    private String stdout;
    
    @Column(columnDefinition = "TEXT")
    private String stderr;
    
    @Column(columnDefinition = "TEXT")
    private String compileOutput;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime executedAt;
}
