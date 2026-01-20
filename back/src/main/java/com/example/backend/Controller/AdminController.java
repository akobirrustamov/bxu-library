package com.example.backend.Controller;

import com.example.backend.Services.FileSystemImportService.FileSystemImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin-diyor")
@CrossOrigin
public class AdminController {

    private final FileSystemImportService importService;

    @GetMapping("/import/books")
    public ResponseEntity<?> importBooks() {
        try {
            importService.importBooksFromFanlar();
            return ResponseEntity.ok("Books imported successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
