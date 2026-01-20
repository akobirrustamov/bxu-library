package com.example.backend.Services.FileSystemImportService;

import com.example.backend.Entity.*;
import com.example.backend.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileSystemImportService {

    private final BookRepo bookRepo;
    private final SubjectRepo subjectRepo;
    private final AttachmentRepo attachmentRepo;

    private static final String ROOT = "./fanlar";
//    String ROOT = System.getProperty("user.home") + "/Desktop/fanlar";

    private static final String STORAGE_ROOT = "backend/files";

    public void importBooksFromFanlar() throws IOException {

        File root = new File(ROOT);
        if (!root.exists() || !root.isDirectory()) {
            throw new IllegalStateException("fanlar folder not found");
        }

        for (File subjectDir : root.listFiles(File::isDirectory)) {

            Subject subject = subjectRepo.findByName(subjectDir.getName())
                    .orElseGet(() -> subjectRepo.save(
                            Subject.builder()
                                    .name(subjectDir.getName())
                                    .createdAt(LocalDateTime.now())
                                    .updatedAt(LocalDateTime.now())
                                    .build()
                    ));

            File booksDir = new File(subjectDir, "adabiyotlar");
            if (!booksDir.exists()) continue;

            for (File bookFile : booksDir.listFiles(File::isFile)) {
                processBookFile(bookFile, subject);
            }
        }
    }

    private void processBookFile(File file, Subject subject) throws IOException {

        // filename format: name_author_publisher_genre.pdf
        String[] parts = file.getName().split("_");
        if (parts.length < 4) return;

        String name = parts[0];
        String author = parts[1];
        String publisher = parts[2];
        String genre = parts[3].replace(".pdf", "");

        Attachment pdf = saveFileAsAttachment(file, "/" + subject.getName());

        Book book = Book.builder()
                .name(name)
                .author(author)
                .publisher(publisher)
                .genre(genre)
                .description("Imported from filesystem")
                .createdAt(LocalDateTime.now())
                .subject(subject)
                .pdf(pdf)
                .build();

        bookRepo.save(book);
    }

    private Attachment saveFileAsAttachment(File source, String prefix) throws IOException {

        UUID id = UUID.randomUUID();
        String storedName = source.getName();
        File target = new File(STORAGE_ROOT + prefix + "/" + storedName);

        target.getParentFile().mkdirs();
        Files.copy(source.toPath(), target.toPath());

        Attachment attachment = Attachment.builder()
                .id(id)
                .prefix(prefix)
                .name(storedName)
                .build();

        return attachmentRepo.save(attachment);
    }
}
