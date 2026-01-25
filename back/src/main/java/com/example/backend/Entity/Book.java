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
@Table(
        name = "book"
)
@Entity
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @ManyToOne
    private Attachment image;
    @ManyToOne
    private Attachment pdf;
    private String name;

    private String description;

    private LocalDateTime createdAt;

    private String author;

    private String publisher;

    private String genre;
    private String path;
    private Boolean isHaveLibrary;
    private Integer libraryCount;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false) // Foreign key to Subject
    private Subject subject;

    public Book(String name, String description, LocalDateTime createdAt, String author, String publisher, String genre, Subject subject, String path, Attachment image, Attachment pdf) {
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.author = author;
        this.publisher = publisher;
        this.genre = genre;
        this.subject = subject;
        this.path = path;
        this.image= image;
        this.pdf = pdf;
    }
}
