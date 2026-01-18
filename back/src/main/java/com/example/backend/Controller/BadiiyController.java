package com.example.backend.Controller;

import com.example.backend.DTO.BadiiyDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Badiiy;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.BadiiyRepo;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/badiiy")
public class BadiiyController {

    private final BadiiyRepo badiiyRepo;
    private final AttachmentRepo attachmentRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody BadiiyDTO dto) {

        Attachment pdf = null;
        Attachment image = null;

        if (dto.getPdfId() != null) {
            pdf = attachmentRepo.findById(dto.getPdfId())
                    .orElseThrow(() -> new RuntimeException("PDF not found"));
        }

        if (dto.getImageId() != null) {
            image = attachmentRepo.findById(dto.getImageId())
                    .orElseThrow(() -> new RuntimeException("Image not found"));
        }

        Badiiy badiiy = Badiiy.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .author(dto.getAuthor())
                .publisher(dto.getPublisher())
                .genre(dto.getGenre())
                .path(dto.getPath())
                .pdf(pdf)
                .image(image)
                .createdAt(LocalDateTime.now())
                .build();

        badiiyRepo.save(badiiy);

        return ResponseEntity.ok(toDTO(badiiy));
    }

    /* =========================
       READ ALL (PAGINATION + FILTER)
    ========================= */
    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "") String publisher,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Badiiy> result = badiiyRepo
                .findAllByTitleAuthorPublisher(title, author, publisher, pageable);

        return ResponseEntity.ok(
                result.map(this::toDTO)
        );
    }

    /* =========================
       READ ONE
    ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {

        Badiiy badiiy = badiiyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Badiiy book not found"));

        return ResponseEntity.ok(badiiy);
    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody BadiiyDTO dto
    ) {
        Badiiy badiiy = badiiyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Badiiy book not found"));

        badiiy.setName(dto.getName());
        badiiy.setDescription(dto.getDescription());
        badiiy.setAuthor(dto.getAuthor());
        badiiy.setPublisher(dto.getPublisher());
        badiiy.setGenre(dto.getGenre());
        badiiy.setPath(dto.getPath());

        if (dto.getPdfId() != null) {
            Attachment pdf = attachmentRepo.findById(dto.getPdfId())
                    .orElseThrow(() -> new RuntimeException("PDF not found"));
            badiiy.setPdf(pdf);
        }

        if (dto.getImageId() != null) {
            Attachment image = attachmentRepo.findById(dto.getImageId())
                    .orElseThrow(() -> new RuntimeException("Image not found"));
            badiiy.setImage(image);
        }

        badiiyRepo.save(badiiy);

        return ResponseEntity.ok(toDTO(badiiy));
    }

    /* =========================
       DELETE
    ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        if (!badiiyRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        badiiyRepo.deleteById(id);
        return ResponseEntity.ok("Badiiy book deleted");
    }

    /* =========================
       DOWNLOAD PDF
    ========================= */

    /* =========================
       ENTITY → DTO
    ========================= */
    private BadiiyDTO toDTO(Badiiy b) {
        return BadiiyDTO.builder()
                .id(b.getId())
                .name(b.getName())
                .description(b.getDescription())
                .author(b.getAuthor())
                .publisher(b.getPublisher())
                .genre(b.getGenre())
                .path(b.getPath())
                .createdAt(b.getCreatedAt())
                .pdfId(b.getPdf() != null ? b.getPdf().getId() : null)
                .imageId(b.getImage() != null ? b.getImage().getId() : null)
                .build();
    }
}
