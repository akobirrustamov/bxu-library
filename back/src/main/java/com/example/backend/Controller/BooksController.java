package com.example.backend.Controller;

import com.example.backend.DTO.BookDTO;
import com.example.backend.DTO.ShelfTitleCountDTO;
import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import com.example.backend.Repository.ShelfRepo;
import com.example.backend.DTO.ShelfDTO;
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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
    private final ShelfRepo shelfRepo;

    /* =========================
       CREATE
    ========================= */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookDTO dto) {

        if (dto.getBookType() == null || dto.getBookType() < 1 || dto.getBookType() > 3) {
            return ResponseEntity.badRequest().body("bookType must be one of: 1, 2, 3");
        }

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        if (bookRepo.existsByNameAndSubject(dto.getName(), subject)) {
            return ResponseEntity.badRequest().body("Book already exists for this subject");
        }

        Attachment image = getAttachment(dto.getImageId());
        Attachment pdf = getAttachment(dto.getPdfId());

        Shelf shelf = findOrCreateShelf(dto.getShelf());

        Book book = Book.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .author(dto.getAuthor())
                .publisher(dto.getPublisher())
                .bookType(dto.getBookType())
                .shelf(shelf)
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
    public ResponseEntity<Page<BookDTO>> getAll(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "") String publisher,
            @RequestParam(required = false) Integer subjectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookDTO> result = bookRepo
                .findAllByTitleAuthorPublisherAndSubject(title, author, publisher, subjectId, pageable)
                .map(this::toDTO);                           // ← добавить .map(this::toDTO)
        return ResponseEntity.ok(result);
    }


    /* =========================
       READ BY SUBJECT
    ========================= */
    @GetMapping("/by-subject/{subjectId}")
    public ResponseEntity<List<BookDTO>> getBySubject(
            @PathVariable Integer subjectId,
            @RequestParam(required = false) Integer facultyId,
            @RequestParam(required = false) Integer kurs
    ) {

        System.out.println("[BooksController] by-subject request: subjectId=" + subjectId + ", facultyId=" + facultyId + ", kurs=" + kurs);

        // Resolve kurs: if facultyId provided, get the kurs list from FacultySubject
        final Integer resolvedKurs;
        if (facultyId != null) {
            List<Integer> kursList = facultySubjectRepo
                .findFirstByFaculty_IdAndSubject_Id(facultyId, subjectId)
                .map(FacultySubject::getKurs)
                .orElse(null);

            if (kursList != null && !kursList.isEmpty()) {
                // If kurs parameter is provided and in the list, use it
                if (kurs != null && kursList.contains(kurs)) {
                    resolvedKurs = kurs;
                } else {
                    // Otherwise use the first element
                    resolvedKurs = kursList.get(0);
                }
            } else {
                resolvedKurs = null;
            }
        } else {
            resolvedKurs = kurs; // Use the provided kurs parameter if no facultyId
        }

        List<BookDTO> list = bookRepo.findBySubjectId(subjectId)
                .stream()
            .map(book -> toDTO(book, resolvedKurs))
                .collect(Collectors.toList());

        System.out.println("[BooksController] by-subject result count=" + list.size());
        if (!list.isEmpty()) {
            BookDTO sample = list.get(0);
            System.out.println("[BooksController] sample dto keys: id=" + sample.getId()
                    + ", subjectId=" + sample.getSubjectId()
                    + ", kurs=" + sample.getKurs()
                    + ", name=" + sample.getName());
        }
        if (kurs != null) {
            System.out.println("[BooksController] NOTE: kurs parameter is accepted for compatibility; current resolvedKurs=" + resolvedKurs);
        }

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

        if (dto.getBookType() == null || dto.getBookType() < 1 || dto.getBookType() > 3) {
            return ResponseEntity.badRequest().body("bookType must be one of: 1, 2, 3");
        }

        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        book.setName(dto.getName());
        book.setDescription(dto.getDescription());
        book.setAuthor(dto.getAuthor());
        book.setPublisher(dto.getPublisher());
        book.setBookType(dto.getBookType());
        Shelf shelf = resolveShelf(dto);
        book.setShelf(shelf);
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

    @GetMapping("/shelves")
    public ResponseEntity<List<ShelfDTO>> getShelves() {
        Map<String, Long> shelfCounts = new HashMap<>();

        for (Object[] row : bookRepo.countBooksByShelfName()) {
            String name = (String) row[0];
            Long count = (Long) row[1];
            shelfCounts.put(name, count);
        }

        List<ShelfDTO> shelves = shelfRepo.findAllByOrderByNameAsc()
                .stream()
                .map(s -> ShelfDTO.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .count(shelfCounts.getOrDefault(s.getName(), 0L))
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(shelves);
    }

    @GetMapping("/shelf-report")
    public ResponseEntity<List<ShelfTitleCountDTO>> getShelfReport(
            @RequestParam Integer shelfId
    ) {
        List<ShelfTitleCountDTO> report = new java.util.ArrayList<>();

        for (Object[] row : bookRepo.countBooksByShelfIdGroupedByTitle(shelfId)) {
            report.add(ShelfTitleCountDTO.builder()
                    .title((String) row[0])
                    .count((Long) row[2])
                    .build());
        }

        return ResponseEntity.ok(report);
    }

    @PostMapping("/shelves")
    public ResponseEntity<?> createShelf(@RequestBody ShelfDTO dto) {
        String normalized = normalizeShelf(dto.getName());
        if (normalized == null) {
            return ResponseEntity.badRequest().body("Shelf name is required");
        }

        if (shelfRepo.existsByName(normalized)) {
            return ResponseEntity.badRequest().body("Shelf already exists");
        }

        Shelf shelf = shelfRepo.save(Shelf.builder().name(normalized).build());
        return ResponseEntity.ok(ShelfDTO.builder().id(shelf.getId()).name(shelf.getName()).build());
    }

    @PutMapping("/shelves/{id}")
    public ResponseEntity<?> updateShelf(@PathVariable Integer id, @RequestBody ShelfDTO dto) {
        Shelf shelf = shelfRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shelf not found"));

        String normalized = normalizeShelf(dto.getName());
        if (!shelf.getName().equals(normalized) && shelfRepo.existsByName(normalized)) {
            return ResponseEntity.badRequest().body("Shelf already exists");
        }

        shelf.setName(normalized);
        shelfRepo.save(shelf);
        return ResponseEntity.ok(ShelfDTO.builder().id(shelf.getId()).name(shelf.getName()).build());
    }

    @DeleteMapping("/shelves/{id}")
    public ResponseEntity<?> deleteShelf(@PathVariable Integer id) {
        Shelf shelf = shelfRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shelf not found"));

        List<Book> books = bookRepo.findAllByShelf_Id(id);
        for (Book book : books) {
            book.setShelf(null);
        }
        if (!books.isEmpty()) {
            bookRepo.saveAll(books);
        }

        shelfRepo.deleteById(id);
        return ResponseEntity.ok("Shelf deleted successfully");
    }

    /* =========================
       HELPERS
    ========================= */
    private Attachment getAttachment(UUID id) {
        if (id == null) return null;
        return attachmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    private Shelf resolveShelf(BookDTO dto) {
        if (dto.getShelfId() != null) {
            return shelfRepo.findById(dto.getShelfId())
                    .orElseThrow(() -> new IllegalArgumentException("Shelf not found"));
        }
        return findOrCreateShelf(dto.getShelf());
    }

    private BookDTO toDTO(Book book) {
        return toDTO(book, null);
    }

    private BookDTO toDTO(Book book, Integer kurs) {
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
                .kurs(kurs)
                .bookType(book.getBookType())
                .shelfId(book.getShelf() != null ? book.getShelf().getId() : null)
                .shelf(book.getShelf() != null ? book.getShelf().getName() : null)
                .isHaveLibrary(book.getIsHaveLibrary())
                .libraryCount(book.getLibraryCount())
                .imageId(book.getImage() != null ? book.getImage().getId() : null)
                .pdfId(book.getPdf() != null ? book.getPdf().getId() : null)
                .build();
    }

    private String normalizeShelf(String shelf) {
        if (shelf == null) return null;
        String normalized = shelf.trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
        if (normalized.isEmpty()) return null;
        if (!normalized.matches("^[A-Z]\\d+$")) {
            throw new IllegalArgumentException("Shelf must consist of a Latin uppercase letter followed by digit(s), e.g. A1");
        }
        return normalized;
    }

    private String normalizeShelfSafe(String shelf) {
        if (shelf == null) return null;
        try {
            return normalizeShelf(shelf);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleInvalidShelf(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    private Shelf findOrCreateShelf(String shelfName) {
        String normalized = normalizeShelf(shelfName);
        if (normalized == null) {
            return null;
        }
        return shelfRepo.findByName(normalized)
                .orElseGet(() -> shelfRepo.save(Shelf.builder().name(normalized).build()));
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
