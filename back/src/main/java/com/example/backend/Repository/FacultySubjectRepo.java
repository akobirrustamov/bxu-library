package com.example.backend.Repository;

import com.example.backend.Entity.FacultySubject;
import com.example.backend.Entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FacultySubjectRepo extends JpaRepository<FacultySubject, Integer> {
    @Query(value = "select * from faculty_subject where faculty_id=:facultyId", nativeQuery = true)
    List<FacultySubject> findAllSubjectsByFacultyId(Integer facultyId);
}
