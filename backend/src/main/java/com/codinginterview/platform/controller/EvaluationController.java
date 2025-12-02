package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.ExecutionResult;
import com.codinginterview.platform.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluation")
@RequiredArgsConstructor
public class EvaluationController {
    
    private final EvaluationService evaluationService;
    
    @PostMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> evaluateSession(@PathVariable String sessionId) {
        Map<String, Object> result = evaluationService.evaluateSessionCode(sessionId);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/session/{sessionId}/results")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExecutionResult>> getSessionResults(@PathVariable String sessionId) {
        List<ExecutionResult> results = evaluationService.getSessionResults(sessionId);
        return ResponseEntity.ok(results);
    }
}
