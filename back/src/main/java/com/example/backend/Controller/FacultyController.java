package com.example.backend.Controller;

import com.example.backend.DTO.FacultyDTO;
import com.example.backend.Entity.EducationType;
import com.example.backend.Entity.Faculty;
import com.example.backend.Repository.EducationTypeRepo;
import com.example.backend.Repository.FacultyRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/faculty")
public class FacultyController {

    private final FacultyRepo facultyRepo;
    private final EducationTypeRepo educationTypeRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody FacultyDTO dto) {

        if (facultyRepo.existsByCode(dto.getCode())) {
            return ResponseEntity.badRequest().body("Faculty code already exists");
        }

        EducationType educationType = educationTypeRepo.findById(dto.getEducationTypeId())
                .orElseThrow(() -> new RuntimeException("EducationType not found"));

        Faculty faculty = Faculty.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .educationType(educationType)
                .build();

        facultyRepo.save(faculty);

        return ResponseEntity.ok(toDTO(faculty));
    }

    /* =========================
       READ ALL BY EDUCATION TYPE
    ========================= */
    @GetMapping("/by-education/{educationId}")
    public ResponseEntity<List<FacultyDTO>> findAllByEducation(
            @PathVariable Integer educationId
    ) {
        List<FacultyDTO> list = facultyRepo.findAllByEducationType(educationId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    /* =========================
       READ ONE
    ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<FacultyDTO> findOne(@PathVariable Integer id) {

        Faculty faculty = facultyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return ResponseEntity.ok(toDTO(faculty));
    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public ResponseEntity<FacultyDTO> update(
            @PathVariable Integer id,
            @RequestBody FacultyDTO dto
    ) {

        Faculty faculty = facultyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        EducationType educationType = educationTypeRepo.findById(dto.getEducationTypeId())
                .orElseThrow(() -> new RuntimeException("EducationType not found"));

        faculty.setCode(dto.getCode());
        faculty.setName(dto.getName());
        faculty.setEducationType(educationType);

        facultyRepo.save(faculty);

        return ResponseEntity.ok(toDTO(faculty));
    }

    /* =========================
       DELETE
    ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        if (!facultyRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        facultyRepo.deleteById(id);
        return ResponseEntity.ok("Faculty deleted successfully");
    }

    /* =========================
       ENTITY → DTO
    ========================= */
    private FacultyDTO toDTO(Faculty faculty) {
        return FacultyDTO.builder()
                .id(faculty.getId())
                .code(faculty.getCode())
                .name(faculty.getName())
                .educationTypeId(
                        faculty.getEducationType() != null
                                ? faculty.getEducationType().getId()
                                : null
                )
                .build();
    }
}
