package com.codinginterview.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewSessionRequest {
    @NotBlank(message = "Question ID is required")
    private String questionId;
    
    @NotBlank(message = "Candidate ID is required")
    private String candidateId;
    
    @NotBlank(message = "Interviewer ID is required")
    private String interviewerId;
    
    @NotNull(message = "Timer duration is required")
    private Integer timerDuration; // in minutes
}
