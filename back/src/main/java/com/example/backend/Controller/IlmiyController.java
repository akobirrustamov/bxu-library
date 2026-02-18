package com.example.backend.Controller;

import com.example.backend.DTO.IlmiyDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Ilmiy;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.IlmiyRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/ilmiy")
public class IlmiyController {

    private final IlmiyRepo ilmiyRepo;
    private final AttachmentRepo attachmentRepo;

    /* =========================
        CREATE
    ========================= */

    @PostMapping
    public ResponseEntity<?> create(@RequestBody IlmiyDTO dto) {
        System.out.println(dto);
        Attachment attachment = null;

        if (dto.getPdfId() != null) {
            attachment = attachmentRepo.findById(dto.getPdfId())
                    .orElseThrow(() -> new RuntimeException("PDF not found"));
        }

        Ilmiy ilmiy = Ilmiy.builder()
                .mavzu(dto.getMavzu())
                .ixtisosligi(dto.getIxtisosligi())
                .author(dto.getAuthor())
                .genre(dto.getGenre())
                .isHaveLibrary(dto.getIsHaveLibrary())
                .libraryCount(dto.getLibraryCount())
                .createdAt(LocalDateTime.now())
                .pdf(attachment)
                .build();

        ilmiyRepo.save(ilmiy);

        return ResponseEntity.ok(ilmiy);
    }

    /* =========================
        READ ALL
    ========================= */

    @GetMapping
    public ResponseEntity<List<Ilmiy>> getAll() {
        return ResponseEntity.ok(ilmiyRepo.findAll());
    }

    /* =========================
        READ BY ID
    ========================= */

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {

        Optional<Ilmiy> ilmiy = ilmiyRepo.findById(id);

        if (ilmiy.isEmpty()) {
            return ResponseEntity.badRequest().body("Ilmiy not found");
        }

        return ResponseEntity.ok(ilmiy.get());
    }

    /* =========================
        UPDATE
    ========================= */

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody IlmiyDTO dto
    ) {

        Ilmiy ilmiy = ilmiyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ilmiy not found"));

        Attachment attachment = null;

        if (dto.getPdfId() != null) {
            attachment = attachmentRepo.findById(dto.getPdfId())
                    .orElseThrow(() -> new RuntimeException("PDF not found"));
        }

        ilmiy.setMavzu(dto.getMavzu());
        ilmiy.setIxtisosligi(dto.getIxtisosligi());
        ilmiy.setAuthor(dto.getAuthor());
        ilmiy.setGenre(dto.getGenre());
        ilmiy.setIsHaveLibrary(dto.getIsHaveLibrary());
        ilmiy.setLibraryCount(dto.getLibraryCount());
        ilmiy.setPdf(attachment);

        ilmiyRepo.save(ilmiy);

        return ResponseEntity.ok(ilmiy);
    }

    /* =========================
        DELETE
    ========================= */

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        Ilmiy ilmiy = ilmiyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ilmiy not found"));

        ilmiyRepo.delete(ilmiy);

        return ResponseEntity.ok("Deleted successfully");
    }

    /* =========================
        FILTER
========================= */

 /* =========================
    FILTER
========================= */

    @GetMapping("/filter")
    public ResponseEntity<?> filter(
            @RequestParam(required = false) String mavzu,
            @RequestParam(required = false) String ixtisosligi,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Boolean isHaveLibrary,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAt
    ) {
        List<Ilmiy> result = ilmiyRepo.filter(
                mavzu,
                ixtisosligi,
                author,
                genre,
                isHaveLibrary,
                createdAt
        );
        return ResponseEntity.ok(result);
    }
}