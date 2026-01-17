package com.example.backend.Controller;

import com.example.backend.DTO.SubjectDTO;
import com.example.backend.Entity.Subject;
import com.example.backend.Repository.SubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/subject")
public class SubjectController {

    private final SubjectRepo subjectRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody SubjectDTO dto) {

        if (subjectRepo.existsByName(dto.getName())) {
            return ResponseEntity.badRequest().body("Subject already exists");
        }

        Subject subject = Subject.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        subjectRepo.save(subject);

        return ResponseEntity.ok(toDTO(subject));
    }

    /* =========================
       READ ALL
    ========================= */
    @GetMapping
    public ResponseEntity<List<SubjectDTO>> findAll() {

        List<SubjectDTO> list = subjectRepo.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    /* =========================
       READ ONE
    ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> findOne(@PathVariable Integer id) {

        Subject subject = subjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        return ResponseEntity.ok(toDTO(subject));
    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody SubjectDTO dto
    ) {

        Subject subject = subjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        subject.setName(dto.getName());
        subject.setDescription(dto.getDescription());
        subject.setUpdatedAt(LocalDateTime.now());

        subjectRepo.save(subject);

        return ResponseEntity.ok(toDTO(subject));
    }

    /* =========================
       DELETE
    ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        if (!subjectRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        subjectRepo.deleteById(id);
        return ResponseEntity.ok("Subject deleted successfully");
    }

    /* =========================
       ENTITY → DTO
    ========================= */
    private SubjectDTO toDTO(Subject subject) {
        return SubjectDTO.builder()
                .id(subject.getId())
                .name(subject.getName())
                .description(subject.getDescription())
                .createdAt(subject.getCreatedAt())
                .updatedAt(subject.getUpdatedAt())
                .build();
    }
}
