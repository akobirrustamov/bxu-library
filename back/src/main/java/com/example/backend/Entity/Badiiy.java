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
@Table(name = "badiiy")
@Entity
@Builder
public class Badiiy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private String author;
    private String publisher;
    private String genre;
    private String path;
    public Badiiy(String name, String description, LocalDateTime createdAt, String author, String genre, String publisher, String path) {
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.author = author;
        this.genre = genre;
        this.publisher = publisher;
        this.path = path;
    }


}
