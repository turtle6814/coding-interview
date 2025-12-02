package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, String> {
    List<Question> findByDifficulty(Question.Difficulty difficulty);
    List<Question> findByTopic(String topic);
    List<Question> findByCreatedById(String createdById);
}
