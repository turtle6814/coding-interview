package com.codinginterview.platform.controller;

import com.codinginterview.platform.domain.Question;
import com.codinginterview.platform.domain.TestCase;
import com.codinginterview.platform.domain.User;
import com.codinginterview.platform.dto.QuestionDTO;
import com.codinginterview.platform.dto.TestCaseDTO;
import com.codinginterview.platform.repository.UserRepository;
import com.codinginterview.platform.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    
    private final QuestionService questionService;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topic) {
        
        List<Question> questions;
        
        if (difficulty != null) {
            questions = questionService.getQuestionsByDifficulty(Question.Difficulty.valueOf(difficulty.toUpperCase()));
        } else if (topic != null) {
            questions = questionService.getQuestionsByTopic(topic);
        } else {
            questions = questionService.getAllQuestions();
        }
        
        List<QuestionDTO> questionDTOs = questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(questionDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id)
                .map(question -> ResponseEntity.ok(convertToDTO(question)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(
            @Valid @RequestBody QuestionDTO questionDTO,
            Authentication authentication) {
        
        User creator = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Question question = convertToEntity(questionDTO);
        question.setCreatedBy(creator);
        
        Question savedQuestion = questionService.createQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedQuestion));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody QuestionDTO questionDTO) {
        
        Question question = convertToEntity(questionDTO);
        Question updatedQuestion = questionService.updateQuestion(id, question);
        return ResponseEntity.ok(convertToDTO(updatedQuestion));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/test-cases")
    public ResponseEntity<List<TestCaseDTO>> getTestCases(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean includeHidden,
            Authentication authentication) {
        
        List<TestCase> testCases;
        
        // Only interviewers can see hidden test cases
        if (includeHidden && hasInterviewerRole(authentication)) {
            testCases = questionService.getTestCasesByQuestionId(id);
        } else {
            testCases = questionService.getVisibleTestCases(id);
        }
        
        List<TestCaseDTO> testCaseDTOs = testCases.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(testCaseDTOs);
    }
    
    @PostMapping("/{id}/test-cases")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> addTestCase(
            @PathVariable String id,
            @Valid @RequestBody TestCaseDTO testCaseDTO) {
        
        TestCase testCase = convertToEntity(testCaseDTO);
        TestCase savedTestCase = questionService.addTestCase(id, testCase);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedTestCase));
    }
    
    @DeleteMapping("/test-cases/{testCaseId}")
    @PreAuthorize("hasAnyAuthority('INTERVIEWER', 'ADMIN')")
    public ResponseEntity<Void> deleteTestCase(@PathVariable String testCaseId) {
        questionService.deleteTestCase(testCaseId);
        return ResponseEntity.noContent().build();
    }
    
    private boolean hasInterviewerRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("INTERVIEWER") || a.getAuthority().equals("ADMIN"));
    }
    
    private QuestionDTO convertToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setTitle(question.getTitle());
        dto.setDescription(question.getDescription());
        dto.setDifficulty(question.getDifficulty());
        dto.setTopic(question.getTopic());
        dto.setSampleInput(question.getSampleInput());
        dto.setSampleOutput(question.getSampleOutput());
        dto.setHints(question.getHints());
        dto.setStarterCode(question.getStarterCode());
        dto.setTimeLimit(question.getTimeLimit());
        if (question.getCreatedBy() != null) {
            dto.setCreatedBy(question.getCreatedBy().getUsername());
        }
        return dto;
    }
    
    private Question convertToEntity(QuestionDTO dto) {
        Question question = new Question();
        question.setTitle(dto.getTitle());
        question.setDescription(dto.getDescription());
        question.setDifficulty(dto.getDifficulty());
        question.setTopic(dto.getTopic());
        question.setSampleInput(dto.getSampleInput());
        question.setSampleOutput(dto.getSampleOutput());
        question.setHints(dto.getHints());
        question.setStarterCode(dto.getStarterCode());
        question.setTimeLimit(dto.getTimeLimit());
        return question;
    }
    
    private TestCaseDTO convertToDTO(TestCase testCase) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setId(testCase.getId());
        dto.setInput(testCase.getInput());
        dto.setExpectedOutput(testCase.getExpectedOutput());
        dto.setIsHidden(testCase.getIsHidden());
        dto.setPoints(testCase.getPoints());
        dto.setTimeLimit(testCase.getTimeLimit());
        dto.setMemoryLimit(testCase.getMemoryLimit());
        dto.setDescription(testCase.getDescription());
        return dto;
    }
    
    private TestCase convertToEntity(TestCaseDTO dto) {
        TestCase testCase = new TestCase();
        testCase.setInput(dto.getInput());
        testCase.setExpectedOutput(dto.getExpectedOutput());
        testCase.setIsHidden(dto.getIsHidden());
        testCase.setPoints(dto.getPoints());
        testCase.setTimeLimit(dto.getTimeLimit());
        testCase.setMemoryLimit(dto.getMemoryLimit());
        testCase.setDescription(dto.getDescription());
        return testCase;
    }
}
