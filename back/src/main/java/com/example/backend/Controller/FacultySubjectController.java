package com.example.backend.Controller;

import com.example.backend.DTO.FacultySubjectDTO;
import com.example.backend.Entity.Faculty;
import com.example.backend.Entity.FacultySubject;
import com.example.backend.Entity.Subject;
import com.example.backend.Repository.BookRepo;
import com.example.backend.Repository.FacultyRepo;
import com.example.backend.Repository.FacultySubjectRepo;
import com.example.backend.Repository.SubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/faculty-subject")
public class FacultySubjectController {

    private final FacultySubjectRepo facultySubjectRepo;
    private final FacultyRepo facultyRepo;
    private final SubjectRepo subjectRepo;
        private final BookRepo bookRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody FacultySubjectDTO dto) {

        if (facultySubjectRepo.existsByFaculty_IdAndSubject_Id(
                dto.getFacultyId(), dto.getSubjectId())) {
            return ResponseEntity.badRequest().body("This subject already assigned to faculty");
        }

        Faculty faculty = facultyRepo.findById(dto.getFacultyId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        FacultySubject facultySubject = FacultySubject.builder()
                .faculty(faculty)
                .subject(subject)
                .kurs(dto.getKurs())
                .build();

        facultySubjectRepo.save(facultySubject);

        return ResponseEntity.ok(toDTO(facultySubject));
    }

    /* =========================
       READ ALL BY FACULTY (optional kurs filter)
    ========================= */
    @GetMapping("/by-faculty/{facultyId}")
    public ResponseEntity<List<FacultySubjectDTO>> getByFaculty(
            @PathVariable Integer facultyId,
            @RequestParam(required = false) Integer kurs
    ) {
        List<FacultySubject> list = facultySubjectRepo.findAllSubjectsByFacultyId(facultyId);

        // Filter by kurs if provided (check if kurs list contains the value)
        if (kurs != null) {
            list = list.stream()
                    .filter(fs -> fs.getKurs() != null && fs.getKurs().contains(kurs))
                    .collect(Collectors.toList());
        }

        List<Integer> subjectIds = list.stream()
                .map(fs -> fs.getSubject().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Integer, Long> bookCountBySubject = new HashMap<>();
        if (!subjectIds.isEmpty()) {
            List<Object[]> rows = bookRepo.countBooksBySubjectIds(subjectIds);
            for (Object[] row : rows) {
                Integer subjectId = (Integer) row[0];
                Long count = (Long) row[1];
                bookCountBySubject.put(subjectId, count);
            }
        }

        return ResponseEntity.ok(
                list.stream()
                        .map(fs -> toDTO(fs, bookCountBySubject.getOrDefault(fs.getSubject().getId(), 0L)))
                        .collect(Collectors.toList())
        );
    }

    /* =========================
       KURS LIST BY FACULTY
    ========================= */
    @GetMapping("/by-faculty/{facultyId}/kurs-list")
    public ResponseEntity<List<Integer>> getKursList(@PathVariable Integer facultyId) {
        List<Integer> kursList = facultySubjectRepo
                .findAllSubjectsByFacultyId(facultyId)
                .stream()
                .map(FacultySubject::getKurs)
                .filter(k -> k != null)
                .flatMap(List::stream)  // Flatten the list of lists
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        return ResponseEntity.ok(kursList);
    }

    /* =========================
       READ ONE
    ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {

        FacultySubject facultySubject = facultySubjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("FacultySubject not found"));

        return ResponseEntity.ok(toDTO(facultySubject));
    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody FacultySubjectDTO dto
    ) {

        FacultySubject facultySubject = facultySubjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("FacultySubject not found"));

        Faculty faculty = facultyRepo.findById(dto.getFacultyId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        facultySubject.setFaculty(faculty);
        facultySubject.setSubject(subject);
        facultySubject.setKurs(dto.getKurs());

        facultySubjectRepo.save(facultySubject);

        return ResponseEntity.ok(toDTO(facultySubject));
    }

    /* =========================
       DELETE
    ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        if (!facultySubjectRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        facultySubjectRepo.deleteById(id);
        return ResponseEntity.ok("FacultySubject deleted successfully");
    }

    /* =========================
       ENTITY → DTO
    ========================= */
    private FacultySubjectDTO toDTO(FacultySubject fs) {
                return toDTO(fs, 0L);
        }

        private FacultySubjectDTO toDTO(FacultySubject fs, Long bookCount) {
        return FacultySubjectDTO.builder()
                .id(fs.getId())
                .facultyId(fs.getFaculty().getId())
                .subjectId(fs.getSubject().getId())
                .kurs(fs.getKurs())
                .facultyName(fs.getFaculty().getName())
                .subjectName(fs.getSubject().getName())
                                .description(fs.getSubject().getDescription())
                                .bookCount(bookCount)
                .build();
    }
}
