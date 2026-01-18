package com.example.backend.Controller;

import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileInputStream;
import java.time.LocalDateTime;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/admin")
public class OldAdminController {

    private final BookRepo bookRepo;
    private final SubjectRepo subjectRepo;
    private final FacultyRepo facultyRepo;
    private final FacultySubjectRepo facultySubjectRepo;
    private final EducationTypeRepo educationTypeRepo;
    private final BadiiyRepo badiiyRepo;
    private final AudioRepo audioRepo;
    @GetMapping("/update")
    public HttpEntity<?> updateBooksList() {
//        String folderPath = "H:\\adabiyotlar"; // Adjust this path if needed
        String folderPath = "./fanlar"; // Adjust this path if needed

        if (folderPath == null || folderPath.isEmpty()) {
            return ResponseEntity.badRequest().body("Folder path is empty or not provided.");
        }

        File rootFolder = new File(folderPath);
        if (!rootFolder.exists() || !rootFolder.isDirectory()) {
            return ResponseEntity.badRequest().body("Invalid root folder path.");
        }

        // Clear existing data
        bookRepo.deleteAll();
        facultySubjectRepo.deleteAll();
        subjectRepo.deleteAll();

        for (File subjectFolder : Objects.requireNonNull(rootFolder.listFiles())) {
            if (subjectFolder.isDirectory()) {
                System.out.println("Processing subject folder: " + subjectFolder.getName());

                Subject subject = subjectRepo.findByName(subjectFolder.getName())
                        .orElseGet(() -> {
                            Subject newSubject = Subject.builder()
                                    .name(subjectFolder.getName())
                                    .description("Description for " + subjectFolder.getName())
                                    .createdAt(LocalDateTime.now())
                                    .updatedAt(LocalDateTime.now())
                                    .build();
                            return subjectRepo.save(newSubject);
                        });

                // Process "yonalish.xlsx"
                File yonalishFile = new File(subjectFolder, "yonalish.xlsx");
                if (yonalishFile.exists()) {
                    try (FileInputStream fis = new FileInputStream(yonalishFile)) {
                        Workbook workbook = new XSSFWorkbook(fis);
                        Sheet sheet = workbook.getSheetAt(0);

                        for (Row row : sheet) {
                            try {
                                Cell codeCell = row.getCell(1);
                                Cell nameCell = row.getCell(2);
                                Cell idCell = row.getCell(3);
                                Integer educationTypeId;

                                if (idCell != null) {
                                    if (idCell.getCellType() == CellType.NUMERIC) {
                                        educationTypeId = (int) idCell.getNumericCellValue();
                                    } else if (idCell.getCellType() == CellType.STRING) {
                                        educationTypeId = Integer.parseInt(idCell.getStringCellValue());
                                    } else {
                                        educationTypeId = 1;
                                    }
                                } else {
                                    educationTypeId = 1;
                                }
                                if (codeCell == null || codeCell.getCellType() != CellType.NUMERIC) {
                                    System.err.println("Skipped row " + row.getRowNum() + ": Invalid or empty faculty code.");
                                    continue;
                                }


                                if (codeCell != null && nameCell != null) {
                                    int facultyCode = (int) codeCell.getNumericCellValue();
                                    String facultyName = nameCell.getStringCellValue();

                                    Faculty faculty = facultyRepo.findByCode(String.valueOf(facultyCode))
                                            .orElseGet(() -> {
                                                Faculty newFaculty = Faculty.builder()
                                                        .code(String.valueOf(facultyCode))
                                                        .name(facultyName)
                                                        .educationType(educationTypeRepo.findById(educationTypeId)
                                                                .orElseThrow(() -> new IllegalArgumentException("Invalid educationTypeId")))
                                                        .build();
                                                return facultyRepo.save(newFaculty);
                                            });

                                    FacultySubject facultySubject = new FacultySubject(faculty, subject);
                                    facultySubjectRepo.save(facultySubject);
                                }
                            } catch (Exception e) {
                                System.err.println("Error processing row " + row.getRowNum() + ": " + e.getMessage());
                            }
                        }

                        workbook.close();
                    } catch (Exception e) {
                        System.err.println("Error processing yonalish.xlsx: " + e.getMessage());
                    }
                }

                // Process "adabiyotlar" folder
                // Process "adabiyotlar" folder
                File booksFolder = new File(subjectFolder, "adabiyotlar");
                if (booksFolder.exists() && booksFolder.isDirectory()) {
                    for (File bookFile : Objects.requireNonNull(booksFolder.listFiles())) {
                        try {
                            if (bookFile.isFile() && bookFile.getName().contains("_")) {
                                String[] bookDetails = bookFile.getName().split("_");
                                if (bookDetails.length < 4) {
                                    System.err.println("Skipped file: " + bookFile.getName() + " due to insufficient details.");
                                    continue;
                                }

                                String bookName = bookDetails[0];
                                String author = bookDetails[1];
                                String publisher = bookDetails[2];
                                String genre = bookDetails[3].replace(".pdf", "").replace(".doc", "").replace(".docx", "");

                                // Save book without checking for duplicates
                                Book book = Book.builder()
                                        .name(bookName)
                                        .author(author)
                                        .publisher(publisher)
                                        .genre(genre)
                                        .description("Book from " + subject.getName())
                                        .createdAt(LocalDateTime.now())
                                        .subject(subject)
                                        .path(bookFile.getAbsolutePath())
                                        .build();

                                bookRepo.save(book);
                                System.out.println("Saved book: " + bookName);
                            }
                        } catch (Exception e) {
                            System.err.println("Error processing book file: " + bookFile.getName() + ". " + e.getMessage());
                        }
                    }
                }

            }
        }

        return ResponseEntity.ok("All books and faculties updated successfully.");
    }



    @GetMapping("/update/badiiy")
    public HttpEntity<?> updateBadiiyBooks() {
//        String folderPath = "C:\\Users\\Akobir\\Desktop\\library\\badiiy"; // Adjust this path if needed
        String folderPath = "./badiiy"; // Adjust this path if needed

        if (folderPath == null || folderPath.isEmpty()) {
            return ResponseEntity.badRequest().body("Folder path is empty or not provided.");
        }

        File rootFolder = new File(folderPath);
        if (!rootFolder.exists() || !rootFolder.isDirectory()) {
            return ResponseEntity.badRequest().body("Invalid root folder path.");
        }

        badiiyRepo.deleteAll();

        for (File bookFile : Objects.requireNonNull(rootFolder.listFiles())) {
            try {
                if (bookFile.isFile() && bookFile.getName().contains("_")) {
                    String[] bookDetails = bookFile.getName().split("_");
                    if (bookDetails.length < 4) {
                        System.err.println("Skipped file: " + bookFile.getName() + " due to insufficient details.");
                        continue;
                    }

                    String bookName = bookDetails[0];
                    String author = bookDetails[1];
                    String publisher = bookDetails[2];
                    String genre = bookDetails[3].replace(".pdf", "").replace(".doc", "").replace(".docx", "");

                    // Save Badiiy book
                    Badiiy badiiy = Badiiy.builder()
                            .name(bookName)
                            .author(author)
                            .publisher(publisher)
                            .genre(genre)
                            .description("Badiiy book from folder")
                            .createdAt(LocalDateTime.now())
                            .path(bookFile.getAbsolutePath())
                            .build();

                    badiiyRepo.save(badiiy);
                    System.out.println("Saved badiiy book: " + bookName);
                }
            } catch (Exception e) {
                System.err.println("Error processing book file: " + bookFile.getName() + ". " + e.getMessage());
            }
        }

        return ResponseEntity.ok("All badiiy books updated successfully.");
    }




    @GetMapping("/update/audio")
    public HttpEntity<?> updateAudioBooks() {
        String folderPath = "./audio"; // Adjust this path if needed
//        String folderPath = "C:\\Users\\Akobir\\Desktop\\library\\audio"; // Adjust this path if needed

        if (folderPath == null || folderPath.isEmpty()) {
            return ResponseEntity.badRequest().body("Folder path is empty or not provided.");
        }

        File rootFolder = new File(folderPath);
        if (!rootFolder.exists() || !rootFolder.isDirectory()) {
            return ResponseEntity.badRequest().body("Invalid root folder path.");
        }

        // Clear existing data
        audioRepo.deleteAll();

        for (File audioFile : Objects.requireNonNull(rootFolder.listFiles())) {
            try {
                if (audioFile.isFile() && audioFile.getName().contains("_")) {
                    String[] audioDetails = audioFile.getName().split("_");
                    if (audioDetails.length < 4) {
                        System.err.println("Skipped file: " + audioFile.getName() + " due to insufficient details.");
                        continue;
                    }

                    String name = audioDetails[0];
                    String author = audioDetails[1];
                    String publisher = audioDetails[2];
                    String genre = audioDetails[3].replace(".mp3", "").replace(".wav", "").replace(".flac", "");

                    // Save audio book
                    Audio audio = Audio.builder()
                            .name(name)
                            .author(author)
                            .publisher(publisher)
                            .genre(genre)
                            .description("Audio book from folder")
                            .createdAt(LocalDateTime.now())
                            .path(audioFile.getAbsolutePath())
                            .build();

                    audioRepo.save(audio);
                    System.out.println("Saved audio book: " + name);
                }
            } catch (Exception e) {
                System.err.println("Error processing audio file: " + audioFile.getName() + ". " + e.getMessage());
            }
        }

        return ResponseEntity.ok("All audio books updated successfully.");
    }


}
