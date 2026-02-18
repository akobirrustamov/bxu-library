package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "ilmiy")
@Entity
@Builder
public class Ilmiy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String mavzu;
    private String ixtisosligi;
    private LocalDateTime createdAt;
    private String author;
    private String genre;
    private Boolean isHaveLibrary;
    private Integer libraryCount;
    @ManyToOne
    private Attachment pdf;
    public Ilmiy(String mavzu, String ixtisosligi, LocalDateTime createdAt, String author, String genre) {
        this.mavzu = mavzu;
        this.ixtisosligi = ixtisosligi;
        this.createdAt = createdAt;
        this.author = author;
        this.genre = genre;
    }


}
