package com.codinginterview.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDTO {
    private String id;
    
    @NotBlank(message = "Input is required")
    private String input;
    
    @NotBlank(message = "Expected output is required")
    private String expectedOutput;
    
    @NotNull
    private Boolean isHidden = false;
    
    private Integer points = 10;
    private Integer timeLimit;
    private Integer memoryLimit;
    private String description;
}
