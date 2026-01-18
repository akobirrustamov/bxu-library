package com.example.backend.Controller;

import com.example.backend.DTO.AudioDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Audio;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.AudioRepo;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/audio")
public class AudioController {

    private final AudioRepo audioRepo;
    private final AttachmentRepo attachmentRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody AudioDTO dto) {

        Attachment audioFile = null;
        Attachment image = null;

        if (dto.getAudioId() != null) {
            audioFile = attachmentRepo.findById(dto.getAudioId())
                    .orElseThrow(() -> new RuntimeException("Audio file not found"));
        }

        if (dto.getImageId() != null) {
            image = attachmentRepo.findById(dto.getImageId())
                    .orElseThrow(() -> new RuntimeException("Image not found"));
        }

        Audio audio = Audio.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .author(dto.getAuthor())
                .publisher(dto.getPublisher())
                .genre(dto.getGenre())
                .path(dto.getPath())
                .audio(audioFile)
                .image(image)
                .createdAt(LocalDateTime.now())
                .build();

        audioRepo.save(audio);

        return ResponseEntity.ok(toDTO(audio));
    }

    /* =========================
       READ ALL (PAGINATION + SEARCH)
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

        Page<Audio> result = audioRepo
                .findAllByTitleAuthorPublisher(title, author, publisher, pageable);

        return ResponseEntity.ok(result.map(this::toDTO));
    }

    /* =========================
       READ ONE
    ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {

        Audio audio = audioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Audio not found"));

        return ResponseEntity.ok(toDTO(audio));
    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody AudioDTO dto
    ) {

        Audio audio = audioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Audio not found"));

        audio.setName(dto.getName());
        audio.setDescription(dto.getDescription());
        audio.setAuthor(dto.getAuthor());
        audio.setPublisher(dto.getPublisher());
        audio.setGenre(dto.getGenre());
        audio.setPath(dto.getPath());

        if (dto.getAudioId() != null) {
            Attachment audioFile = attachmentRepo.findById(dto.getAudioId())
                    .orElseThrow(() -> new RuntimeException("Audio file not found"));
            audio.setAudio(audioFile);
        }

        if (dto.getImageId() != null) {
            Attachment image = attachmentRepo.findById(dto.getImageId())
                    .orElseThrow(() -> new RuntimeException("Image not found"));
            audio.setImage(image);
        }

        audioRepo.save(audio);

        return ResponseEntity.ok(toDTO(audio));
    }

    /* =========================
       DELETE
    ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        if (!audioRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        audioRepo.deleteById(id);
        return ResponseEntity.ok("Audio deleted successfully");
    }

    /* =========================
       DOWNLOAD AUDIO
    ========================= */

    /* =========================
       ENTITY → DTO
    ========================= */
    private AudioDTO toDTO(Audio a) {
        return AudioDTO.builder()
                .id(a.getId())
                .name(a.getName())
                .description(a.getDescription())
                .author(a.getAuthor())
                .publisher(a.getPublisher())
                .genre(a.getGenre())
                .path(a.getPath())
                .createdAt(a.getCreatedAt())
                .audioId(a.getAudio() != null ? a.getAudio().getId() : null)
                .imageId(a.getImage() != null ? a.getImage().getId() : null)
                .build();
    }
}
