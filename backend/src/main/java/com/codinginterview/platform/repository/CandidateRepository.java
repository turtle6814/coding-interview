package com.codinginterview.platform.repository;

import com.codinginterview.platform.domain.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, String> {
    List<Candidate> findByStatus(Candidate.CandidateStatus status);
}
