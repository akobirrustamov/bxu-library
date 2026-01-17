package com.example.backend.Repository;

import com.example.backend.Entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FacultyRepo extends JpaRepository<Faculty, Integer> {

    @Query(value = "SELECT * FROM faculty WHERE education_type_id = :education", nativeQuery = true)
    List<Faculty> findAllByEducationType(Integer education);

    @Query(value = "SELECT * FROM faculty WHERE code = :facultyCode", nativeQuery = true)
    Optional<Faculty> findByCode(String facultyCode);

    boolean existsByCode(String code);
}
