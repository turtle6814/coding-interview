package com.codinginterview.platform.dto;

import com.codinginterview.platform.domain.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private String id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Difficulty is required")
    private Question.Difficulty difficulty;
    
    @NotBlank(message = "Topic is required")
    private String topic;
    
    private String sampleInput;
    private String sampleOutput;
    private String hints;
    private String starterCode;
    private Integer timeLimit;
    private String createdBy;
}
