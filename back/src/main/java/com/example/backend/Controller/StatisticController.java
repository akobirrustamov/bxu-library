package com.example.backend.Controller;

import com.example.backend.Entity.EducationType;
import com.example.backend.Entity.Faculty;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/statistic")
public class StatisticController {

    private final EducationTypeRepo educationTypeRepo;
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




    @GetMapping("/education-type-faculty-stats")
    public List<Map<String, Object>> getEducationTypeFacultyStats() {

        List<Object[]> faculties = facultyRepo.findFacultiesWithEducationType();
        List<Object[]> subjectCounts = facultySubjectRepo.countSubjectsByFaculty();
        List<Object[]> bookCounts = bookRepo.countBooksAndLibraryByFaculty();

        Map<Integer, Long> subjectsMap = new HashMap<>();
        for (Object[] row : subjectCounts) {
            subjectsMap.put((Integer) row[0], (Long) row[1]);
        }

        Map<Integer, Map<String, Object>> booksMap = new HashMap<>();
        for (Object[] row : bookCounts) {
            Map<String, Object> data = new HashMap<>();
            data.put("booksCount", row[1]);
            data.put("libraryCountTotal", row[2]);
            booksMap.put((Integer) row[0], data);
        }

        Map<Integer, Map<String, Object>> educationTypeMap = new HashMap<>();

        for (Object[] row : faculties) {
            Integer facultyId = (Integer) row[0];
            String facultyName = (String) row[1];
            Integer educationTypeId = (Integer) row[2];
            String educationTypeName = (String) row[3];

            educationTypeMap.putIfAbsent(educationTypeId, new HashMap<>());
            Map<String, Object> edu = educationTypeMap.get(educationTypeId);

            edu.putIfAbsent("educationTypeId", educationTypeId);
            edu.putIfAbsent("educationTypeName", educationTypeName);
            edu.putIfAbsent("faculties", new java.util.ArrayList<>());

            List<Map<String, Object>> facultyList =
                    (List<Map<String, Object>>) edu.get("faculties");

            Map<String, Object> facultyData = new HashMap<>();
            facultyData.put("facultyId", facultyId);
            facultyData.put("facultyName", facultyName);
            facultyData.put("subjectsCount", subjectsMap.getOrDefault(facultyId, 0L));

            Map<String, Object> bookData = booksMap.getOrDefault(facultyId, Map.of(
                    "booksCount", 0L,
                    "libraryCountTotal", 0L
            ));

            facultyData.put("booksCount", bookData.get("booksCount"));
            facultyData.put("libraryCountTotal", bookData.get("libraryCountTotal"));

            facultyList.add(facultyData);
        }

        return new java.util.ArrayList<>(educationTypeMap.values());
    }




    @GetMapping("/faculty/{facultyId}/subjects")
    public Map<String, Object> getFacultySubjectStats(
            @PathVariable Integer facultyId
    ) {
        Faculty faculty = facultyRepo.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        List<Object[]> subjects = facultySubjectRepo.findSubjectsByFaculty(facultyId);

        List<Integer> subjectIds = subjects.stream()
                .map(s -> (Integer) s[0])
                .toList();

        Map<Integer, Object[]> booksMap = new HashMap<>();
        for (Object[] row : bookRepo.countBooksBySubjectIds(subjectIds)) {
            booksMap.put((Integer) row[0], row);
        }

        List<Map<String, Object>> subjectList = new ArrayList<>();

        for (Object[] s : subjects) {
            Integer subjectId = (Integer) s[0];
            String subjectName = (String) s[1];

            Object[] bookData = booksMap.get(subjectId);

            Map<String, Object> map = new HashMap<>();
            map.put("subjectId", subjectId);
            map.put("subjectName", subjectName);
            map.put("booksCount", bookData != null ? bookData[1] : 0);
            map.put("libraryCountTotal", bookData != null ? bookData[2] : 0);

            subjectList.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("facultyId", faculty.getId());
        response.put("facultyName", faculty.getName());
        response.put("subjects", subjectList);

        return response;
    }




}
