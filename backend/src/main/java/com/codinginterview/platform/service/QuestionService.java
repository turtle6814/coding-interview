package com.codinginterview.platform.service;

import com.codinginterview.platform.domain.Question;
import com.codinginterview.platform.domain.TestCase;
import com.codinginterview.platform.domain.User;
import com.codinginterview.platform.repository.QuestionRepository;
import com.codinginterview.platform.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    public Optional<Question> getQuestionById(String id) {
        return questionRepository.findById(id);
    }
    
    public List<Question> getQuestionsByDifficulty(Question.Difficulty difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }
    
    public List<Question> getQuestionsByTopic(String topic) {
        return questionRepository.findByTopic(topic);
    }
    
    public List<Question> getQuestionsByCreator(String creatorId) {
        return questionRepository.findByCreatedById(creatorId);
    }
    
    @Transactional
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }
    
    @Transactional
    public Question updateQuestion(String id, Question questionDetails) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        question.setTitle(questionDetails.getTitle());
        question.setDescription(questionDetails.getDescription());
        question.setDifficulty(questionDetails.getDifficulty());
        question.setTopic(questionDetails.getTopic());
        question.setSampleInput(questionDetails.getSampleInput());
        question.setSampleOutput(questionDetails.getSampleOutput());
        question.setHints(questionDetails.getHints());
        question.setStarterCode(questionDetails.getStarterCode());
        question.setTimeLimit(questionDetails.getTimeLimit());
        
        return questionRepository.save(question);
    }
    
    @Transactional
    public void deleteQuestion(String id) {
        questionRepository.deleteById(id);
    }
    
    public List<TestCase> getTestCasesByQuestionId(String questionId) {
        return testCaseRepository.findByQuestionId(questionId);
    }
    
    public List<TestCase> getVisibleTestCases(String questionId) {
        return testCaseRepository.findByQuestionIdAndIsHidden(questionId, false);
    }
    
    @Transactional
    public TestCase addTestCase(String questionId, TestCase testCase) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        
        testCase.setQuestion(question);
        return testCaseRepository.save(testCase);
    }
    
    @Transactional
    public void deleteTestCase(String testCaseId) {
        testCaseRepository.deleteById(testCaseId);
    }
}
