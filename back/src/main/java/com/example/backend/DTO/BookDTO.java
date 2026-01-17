package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BookDTO {

    private Integer id;
    private String name;
    private String description;
    private String author;
    private String publisher;
    private String genre;
    private String path;

    private Integer subjectId;
    private String subjectName;

    private UUID imageId;
    private UUID pdfId;

    private LocalDateTime createdAt;
}
