package com.example.backend.Repository;

import com.example.backend.Entity.FacultySubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FacultySubjectRepo extends JpaRepository<FacultySubject, Integer> {

    @Query(value = "SELECT * FROM faculty_subject WHERE faculty_id = :facultyId", nativeQuery = true)
    List<FacultySubject> findAllSubjectsByFacultyId(Integer facultyId);

    boolean existsByFaculty_IdAndSubject_Id(Integer facultyId, Integer subjectId);
}
