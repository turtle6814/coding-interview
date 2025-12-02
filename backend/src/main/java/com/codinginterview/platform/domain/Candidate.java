package com.codinginterview.platform.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "candidates")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Candidate extends User {
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 500)
    private String resumeUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status = CandidateStatus.INVITED;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    public enum CandidateStatus {
        INVITED,
        ACTIVE,
        COMPLETED,
        WITHDRAWN
    }
}
