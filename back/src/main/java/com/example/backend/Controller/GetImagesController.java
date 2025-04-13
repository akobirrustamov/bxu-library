package com.example.backend.Controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/image")
public class GetImagesController {

    private final ResourceLoader resourceLoader;

    @GetMapping("/{name}")
    public ResponseEntity<?> getImage(@PathVariable String name) {
        System.out.println(name);
        try {
            // Base folder containing images
//            Path imagePath = Paths.get("C:\\Users\\Akobir\\Desktop\\library\\front\\img").resolve(name);
            Path imagePath = Paths.get("./libraryImages").resolve(name);

            if (!Files.exists(imagePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Image not found");
            }

            // Load image as a resource
            Resource imageResource = resourceLoader.getResource("file:" + imagePath.toAbsolutePath());
            if (!imageResource.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Image not found");
            }

            String contentType = Files.probeContentType(imagePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(imageResource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving image");
        }
    }
}
