package com.example.backend.Controller;

import com.example.backend.DTO.FacultySubjectDTO;
import com.example.backend.Entity.Faculty;
import com.example.backend.Entity.FacultySubject;
import com.example.backend.Entity.Subject;
import com.example.backend.Repository.FacultyRepo;
import com.example.backend.Repository.FacultySubjectRepo;
import com.example.backend.Repository.SubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/faculty-subject")
public class FacultySubjectController {

    private final FacultySubjectRepo facultySubjectRepo;
    private final FacultyRepo facultyRepo;
    private final SubjectRepo subjectRepo;

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
                .build();

        facultySubjectRepo.save(facultySubject);

        return ResponseEntity.ok(toDTO(facultySubject));
    }

    /* =========================
       READ ALL BY FACULTY
    ========================= */
    @GetMapping("/by-faculty/{facultyId}")
    public ResponseEntity<List<FacultySubjectDTO>> getByFaculty(
            @PathVariable Integer facultyId
    ) {
        List<FacultySubjectDTO> list = facultySubjectRepo
                .findAllSubjectsByFacultyId(facultyId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
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
        return FacultySubjectDTO.builder()
                .id(fs.getId())
                .facultyId(fs.getFaculty().getId())
                .subjectId(fs.getSubject().getId())
                .facultyName(fs.getFaculty().getName())
                .subjectName(fs.getSubject().getName())
                .build();
    }
}
