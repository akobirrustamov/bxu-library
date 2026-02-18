package com.example.backend.DTO;

import com.example.backend.Entity.Attachment;
import jakarta.persistence.ManyToOne;
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
public class IlmiyDTO {
    private String mavzu;
    private String ixtisosligi;
    private String author;
    private String genre;
    private Boolean isHaveLibrary;
    private Integer libraryCount;
    private UUID pdfId;
}
