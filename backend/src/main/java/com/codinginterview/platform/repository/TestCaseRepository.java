package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, String> {
    List<TestCase> findByQuestionId(String questionId);
    List<TestCase> findByQuestionIdAndIsHidden(String questionId, Boolean isHidden);
}
