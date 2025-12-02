package com.codinginterview.platform.service;

import com.codinginterview.platform.domain.ExecutionResult;
import com.codinginterview.platform.domain.InterviewSession;
import com.codinginterview.platform.domain.TestCase;
import com.codinginterview.platform.repository.ExecutionResultRepository;
import com.codinginterview.platform.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EvaluationService {
    
    private final Judge0Service judge0Service;
    private final QuestionService questionService;
    private final ExecutionResultRepository executionResultRepository;
    private final InterviewSessionRepository sessionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public Map<String, Object> evaluateSessionCode(String sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        
        if (session.getQuestion() == null) {
            throw new RuntimeException("No question assigned to session");
        }
        
        String code = session.getCode();
        String language = session.getLanguage();
        String questionId = session.getQuestion().getId();
        
        // Get all test cases for the question
        List<TestCase> testCases = questionService.getTestCasesByQuestionId(questionId);
        
        if (testCases.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "No test cases found for this question");
            return result;
        }
        
        List<Map<String, Object>> testResults = new ArrayList<>();
        int passedCount = 0;
        int totalPoints = 0;
        int earnedPoints = 0;
        
        // Execute code against each test case
        for (TestCase testCase : testCases) {
            totalPoints += testCase.getPoints();
            
            Map<String, Object> executionResult = executeWithInput(
                    code, language, testCase.getInput()
            );
            
            boolean passed = checkOutput(
                    (String) executionResult.get("output"),
                    testCase.getExpectedOutput()
            );
            
            if (passed) {
                passedCount++;
                earnedPoints += testCase.getPoints();
            }
            
            // Save execution result to database
            ExecutionResult result = new ExecutionResult();
            result.setSessionId(sessionId);
            result.setTestCase(testCase);
            result.setPassed(passed);
            result.setActualOutput((String) executionResult.get("output"));
            result.setErrorMessage((String) executionResult.get("error"));
            result.setStdout((String) executionResult.get("output"));
            result.setStderr((String) executionResult.get("error"));
            executionResultRepository.save(result);
            
            // Prepare result for response (hide hidden test case details)
            Map<String, Object> testResult = new HashMap<>();
            testResult.put("testCaseId", testCase.getId());
            testResult.put("passed", passed);
            testResult.put("isHidden", testCase.getIsHidden());
            testResult.put("points", testCase.getPoints());
            
            if (!testCase.getIsHidden()) {
                testResult.put("input", testCase.getInput());
                testResult.put("expectedOutput", testCase.getExpectedOutput());
                testResult.put("actualOutput", executionResult.get("output"));
                testResult.put("description", testCase.getDescription());
            }
            
            if (!passed && executionResult.get("error") != null) {
                testResult.put("error", executionResult.get("error"));
            }
            
            testResults.add(testResult);
        }
        
        // Calculate score percentage
        double scorePercentage = totalPoints > 0 
                ? ((double) earnedPoints / totalPoints) * 100 
                : 0;
        
        // Update session score
        session.setScore(scorePercentage);
        sessionRepository.save(session);
        
        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("success", true);
        finalResult.put("passedCount", passedCount);
        finalResult.put("totalCount", testCases.size());
        finalResult.put("earnedPoints", earnedPoints);
        finalResult.put("totalPoints", totalPoints);
        finalResult.put("scorePercentage", scorePercentage);
        finalResult.put("testResults", testResults);
        
        // Broadcast results via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/session/" + sessionId + "/evaluation",
                finalResult
        );
        
        return finalResult;
    }
    
    private Map<String, Object> executeWithInput(String code, String language, String input) {
        // This is a simplified version - in production, you would modify Judge0Service
        // to accept stdin parameter
        return judge0Service.executeCode(code, language);
    }
    
    private boolean checkOutput(String actual, String expected) {
        if (actual == null || expected == null) {
            return false;
        }
        
        // Normalize whitespace and compare
        String normalizedActual = actual.trim().replaceAll("\\s+", " ");
        String normalizedExpected = expected.trim().replaceAll("\\s+", " ");
        
        return normalizedActual.equals(normalizedExpected);
    }
    
    public List<ExecutionResult> getSessionResults(String sessionId) {
        return executionResultRepository.findBySessionIdOrderByExecutedAtDesc(sessionId);
    }
}
