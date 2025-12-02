package com.codinginterview.platform.dto;

import lombok.Data;

@Data
public class UpdateCandidateRequest {
    private String name;
    private String phoneNumber;
    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;
}
