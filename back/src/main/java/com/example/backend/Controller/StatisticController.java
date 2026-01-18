package com.example.backend.Controller;

import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/statistic")
public class StatisticController {

    private final BookRepo bookRepo;
    private final FacultyRepo facultyRepo;
    private final SubjectRepo subjectRepo;
    private final FacultySubjectRepo facultySubjectRepo;

    @GetMapping
    public Map<String, Object> getStatistics() {

        Map<String, Object> stats = new HashMap<>();

        /* =====================
           BASIC COUNTS
        ===================== */
        stats.put("booksCount", bookRepo.count());
        stats.put("facultiesCount", facultyRepo.count());
        stats.put("subjectsCount", subjectRepo.count());
        stats.put("facultySubjectsCount", facultySubjectRepo.count());

        /* =====================
           BOOK STATISTICS
        ===================== */
        stats.put(
                "last7DaysBooks",
                bookRepo.countBooksAfter(LocalDateTime.now().minusDays(7))
        );

        stats.put(
                "booksBySubject",
                bookRepo.countBooksBySubject()
        );

        /* =====================
           FACULTY STATISTICS
        ===================== */
        stats.put(
                "facultiesByEducationType",
                facultyRepo.countByEducationType()
        );

        /* =====================
           SUBJECT STATISTICS
        ===================== */
        stats.put(
                "unassignedSubjects",
                subjectRepo.countUnassignedSubjects()
        );

        /* =====================
           FACULTY-SUBJECT STATISTICS
        ===================== */
        stats.put(
                "subjectsPerFaculty",
                facultySubjectRepo.countSubjectsPerFaculty()
        );

        return stats;
    }
}
