package com.example.backend.Controller;

import com.example.backend.DTO.BookDTO;
import com.example.backend.Entity.Attachment;
import com.example.backend.Entity.Book;
import com.example.backend.Entity.Subject;
import com.example.backend.Repository.AttachmentRepo;
import com.example.backend.Repository.BookRepo;
import com.example.backend.Repository.SubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/books")
public class BooksController {

    private final BookRepo bookRepo;
    private final SubjectRepo subjectRepo;
    private final AttachmentRepo attachmentRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookDTO dto) {

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (bookRepo.existsByNameAndSubject(dto.getName(), subject)) {
            return ResponseEntity.badRequest().body("Book already exists for this subject");
        }

        Attachment image = getAttachment(dto.getImageId());
        Attachment pdf = getAttachment(dto.getPdfId());

        Book book = Book.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .author(dto.getAuthor())
                .publisher(dto.getPublisher())
                .genre(dto.getGenre())
                .path(dto.getPath())
                .subject(subject)
                .image(image)
                .pdf(pdf)
                .createdAt(LocalDateTime.now())
                .build();

        bookRepo.save(book);
        return ResponseEntity.ok(toDTO(book));
    }

    /* =========================
       READ ALL
    ========================= */
    @GetMapping("/all")
    public ResponseEntity<List<BookDTO>> getAll() {
        return ResponseEntity.ok(
                bookRepo.findAll().stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList())
        );
    }

    /* =========================
       READ BY SUBJECT
    ========================= */
    @GetMapping("/by-subject/{subjectId}")
    public ResponseEntity<List<BookDTO>> getBySubject(@PathVariable Integer subjectId) {

        List<BookDTO> list = bookRepo.findBySubjectId(subjectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    /* =========================
       SEARCH + PAGINATION
    ========================= */
    @GetMapping("/search")
    public ResponseEntity<Page<BookDTO>> search(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "") String publisher,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {

        Page<Book> books = bookRepo.findAllByTitleAuthorPublisher(
                title, author, publisher, PageRequest.of(page, size));

        return ResponseEntity.ok(books.map(this::toDTO));
    }

    /* =========================
       READ ONE
    ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Integer id) {

        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        return ResponseEntity.ok(toDTO(book));
    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody BookDTO dto
    ) {

        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        book.setName(dto.getName());
        book.setDescription(dto.getDescription());
        book.setAuthor(dto.getAuthor());
        book.setPublisher(dto.getPublisher());
        book.setGenre(dto.getGenre());
        book.setPath(dto.getPath());
        book.setSubject(subject);

        if (dto.getImageId() != null)
            book.setImage(getAttachment(dto.getImageId()));

        if (dto.getPdfId() != null)
            book.setPdf(getAttachment(dto.getPdfId()));

        bookRepo.save(book);
        return ResponseEntity.ok(toDTO(book));
    }

    /* =========================
       DELETE
    ========================= */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {

        if (!bookRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        bookRepo.deleteById(id);
        return ResponseEntity.ok("Book deleted successfully");
    }

    /* =========================
       HELPERS
    ========================= */
    private Attachment getAttachment(UUID id) {
        if (id == null) return null;
        return attachmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    private BookDTO toDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .name(book.getName())
                .description(book.getDescription())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .genre(book.getGenre())
                .path(book.getPath())
                .createdAt(book.getCreatedAt())
                .subjectId(book.getSubject().getId())
                .subjectName(book.getSubject().getName())
                .imageId(book.getImage() != null ? book.getImage().getId() : null)
                .pdfId(book.getPdf() != null ? book.getPdf().getId() : null)
                .build();
    }
}
