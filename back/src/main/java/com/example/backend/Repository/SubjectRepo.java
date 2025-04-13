package com.example.backend.Repository;

import com.example.backend.Entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SubjectRepo extends JpaRepository<Subject, Integer> {
    @Query(value = "SELECT * FROM subject WHERE name = :name LIMIT 1", nativeQuery = true)
    Optional<Subject> findByName(String name);
}
