package com.codinginterview.platform.controller;

import com.codinginterview.platform.service.Judge0Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/execute")
@CrossOrigin(origins = "*")
public class ExecutionController {

    @Autowired
    private Judge0Service judge0Service;

    @PostMapping
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String language = request.get("language");
        
        if (code == null || language == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Map<String, Object> result = judge0Service.executeCode(code, language);
        return ResponseEntity.ok(result);
    }
}