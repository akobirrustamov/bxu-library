package com.example.backend.Controller;

import com.example.backend.DTO.BookDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/books")
public class BooksController {

    private final BookRepo bookRepo;
    private final SubjectRepo subjectRepo;
    private final FacultySubjectRepo facultySubjectRepo;
    private final FacultyRepo facultyRepo;
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
                bookRepo.findAllOrderByCreatedAt()
                        .stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList())
        );
    }



    @GetMapping
    public ResponseEntity<Page<Book>> getAll(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "") String publisher,
            @RequestParam(required = false) Integer subjectId, // 👈 NEW
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Book> result = bookRepo.findAllByTitleAuthorPublisherAndSubject(
                title,
                author,
                publisher,
                subjectId,
                pageable
        );

        return ResponseEntity.ok(result);
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

        System.out.print(list);
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

        return ResponseEntity.ok(book);
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
                .isHaveLibrary(book.getIsHaveLibrary())
                .libraryCount(book.getLibraryCount())
                .imageId(book.getImage() != null ? book.getImage().getId() : null)
                .pdfId(book.getPdf() != null ? book.getPdf().getId() : null)
                .build();
    }


    @PutMapping("/library/{id}/{count}")
    public HttpEntity<?> putBookInLibrary(@PathVariable Integer id, @PathVariable Integer count){
        Optional<Book> byId = bookRepo.findById(id);
        if (byId.isEmpty())return ResponseEntity.notFound().build();
        Book book = byId.get();
        if(count==0){
            book.setIsHaveLibrary(false);
            book.setLibraryCount(0);
        }else {
            book.setIsHaveLibrary(true);
            book.setLibraryCount(count);
        }
        Book save = bookRepo.save(book);
        return ResponseEntity.ok(save);
    }


    @GetMapping("/hisobot")
    public ResponseEntity<byte[]> getHisobot() {
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Books Report");

            // ===== HEADER STYLE =====
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // ===== HEADER ROW =====
            Row header = sheet.createRow(0);
            String[] headers = {
                    "№",
                    "Adabiyot nomi",
                    "Muallif",
                    "Nashriyot",
                    "Adabiyot turi",
                    "Silka",
                    "Yo'nalish",
                    "Fan",
                    "Kutubxonada bor",
                    "Soni"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            int counter = 1;

            List<Faculty> faculties = facultyRepo.findAll();

            for (Faculty faculty : faculties) {

                List<FacultySubject> facultySubjects =
                        facultySubjectRepo.findAllSubjectsByFacultyId(faculty.getId());

                for (FacultySubject facultySubject : facultySubjects) {

                    Subject subject = facultySubject.getSubject();
                    List<Book> books = bookRepo.findBySubjectId(subject.getId());

                    for (Book book : books) {
                        Row row = sheet.createRow(rowIdx++);

                        row.createCell(0).setCellValue(counter++);
                        row.createCell(1).setCellValue(book.getName());
                        row.createCell(2).setCellValue(book.getAuthor());
                        row.createCell(3).setCellValue(book.getPublisher());
                        row.createCell(4).setCellValue(book.getGenre());
                        row.createCell(5).setCellValue("https://library.bxu.uz/book/"+book.getId());
                        row.createCell(6).setCellValue(faculty.getName());
                        row.createCell(7).setCellValue(subject.getName());

                        // ===== NEW COLUMNS =====
                        row.createCell(8).setCellValue(
                                Boolean.TRUE.equals(book.getIsHaveLibrary()) ? "Ha" : "Yo‘q"
                        );

                        row.createCell(9).setCellValue(
                                book.getLibraryCount() != null ? book.getLibraryCount() : 0
                        );
                    }
                }
            }

            // ===== AUTO SIZE =====
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // ===== WRITE TO BYTE ARRAY =====
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            workbook.close();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=books_report.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }


}
