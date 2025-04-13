package com.example.backend.Controller;

import com.example.backend.Entity.Audio;
import com.example.backend.Entity.Badiiy;
import com.example.backend.Entity.Book;
import com.example.backend.Repository.AudioRepo;
import com.example.backend.Repository.BadiiyRepo;
import com.example.backend.Repository.BookRepo;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/book")
public class BookController {
    private final AudioRepo audioRepo;
    private final BadiiyRepo badiiyRepo;
    private final BookRepo bookRepo;
    @GetMapping("/all")
    public HttpEntity<?> getAllBooks(){
        List<Book> all = bookRepo.findAll();
        return ResponseEntity.ok(all);

    }

    @GetMapping("/{subjectId}")
    public HttpEntity<?> getBookBySubjectId(@PathVariable Integer subjectId){
        List<Book> books = bookRepo.findBySubjectId(subjectId);
        System.out.println(books);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search")
    public ResponseEntity<?> getBookByTitle(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "") String publisher,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size); // No casting needed
        Page<Book> books = bookRepo.findAllByTitleAuthorPublisher(title, author, publisher, pageable);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/getFile/{id}")
    public void getBookByFileId(@PathVariable Integer id, HttpServletResponse response) {
        System.out.println();
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

        String filePath = book.getPath(); // Ensure this path is correct
        System.out.println(book);
        File file = new File(filePath);

        if (!file.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found at path: " + filePath);
        }

        try {
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"");
            response.setContentLengthLong(file.length());
            FileCopyUtils.copy(new FileInputStream(file), response.getOutputStream());
            response.flushBuffer();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while processing file download", e);
        }
    }



    @GetMapping("/getFile/badiiy/{id}")
    public void getBadiiyByFileId(@PathVariable Integer id, HttpServletResponse response) {

        Badiiy book = badiiyRepo.findById(id).orElseThrow();

        String filePath = book.getPath(); // Ensure this path is correct
        File file = new File(filePath);

        if (!file.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found at path: " + filePath);
        }

        try {
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"");
            response.setContentLengthLong(file.length());
            FileCopyUtils.copy(new FileInputStream(file), response.getOutputStream());
            response.flushBuffer();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while processing file download", e);
        }
    }


    @GetMapping("/badiiy")
    public ResponseEntity<?> getAllBadiiyBooks(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "") String publisher,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Badiiy> badiiyBooks = badiiyRepo.findAllByTitleAuthorPublisher(title, author, publisher, pageable);
        return ResponseEntity.ok(badiiyBooks);
    }

    @GetMapping("/audio")
    public ResponseEntity<?> getAllAudios(
            @RequestParam(defaultValue = "") String title,
            @RequestParam(defaultValue = "") String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        System.out.println(title);
        Pageable pageable = PageRequest.of(page, size);
        Page<Audio> audioBooks = audioRepo.findAllByTitleAndAuthor(title, author, pageable);
        return ResponseEntity.ok(audioBooks);
    }

    @GetMapping("/audio/download/{id}")
    public void downloadAudioById(@PathVariable Integer id, HttpServletResponse response) {
        System.out.println(id);
        Audio audio = audioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audio not found"));

        String filePath = audio.getPath();
        File file = new File(filePath);

        if (!file.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found at path: " + filePath);
        }

        try {
            response.setContentType("audio/mpeg");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"");
            response.setContentLengthLong(file.length());
            FileCopyUtils.copy(new FileInputStream(file), response.getOutputStream());
            response.flushBuffer();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error while processing file download", e);
        }
    }

}
