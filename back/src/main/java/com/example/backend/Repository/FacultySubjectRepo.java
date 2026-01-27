package com.example.backend.Repository;

import com.example.backend.Entity.FacultySubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FacultySubjectRepo extends JpaRepository<FacultySubject, Integer> {

    @Query(value = "SELECT * FROM faculty_subject WHERE faculty_id = :facultyId", nativeQuery = true)
    List<FacultySubject> findAllSubjectsByFacultyId(Integer facultyId);

    boolean existsByFaculty_IdAndSubject_Id(Integer facultyId, Integer subjectId);

    // Jami bog‘lanishlar
    long count();

    // Fakultet bo‘yicha fanlar soni
    @Query("""
SELECT fs.faculty.name, COUNT(fs)
FROM FacultySubject fs
GROUP BY fs.faculty.name
ORDER BY COUNT(fs) DESC
""")
    List<Object[]> countSubjectsPerFaculty();

    @Query("""
        SELECT fs.faculty.id, COUNT(fs.subject.id)
        FROM FacultySubject fs
        GROUP BY fs.faculty.id
    """)
    List<Object[]> countSubjectsByFaculty();


    @Query("""
        SELECT s.id, s.name
        FROM FacultySubject fs
        JOIN fs.subject s
        WHERE fs.faculty.id = :facultyId
    """)
    List<Object[]> findSubjectsByFaculty(@Param("facultyId") Integer facultyId);

}
