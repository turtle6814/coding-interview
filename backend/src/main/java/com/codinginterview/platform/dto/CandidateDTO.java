package com.codinginterview.platform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CandidateDTO {
    private Long id;
    private String email;
    private String name;
    private String phoneNumber;
    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String status;
    private LocalDateTime createdAt;
}
