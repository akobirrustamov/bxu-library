package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "faculty_subject")
@Entity
@Builder
public class FacultySubject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    private Faculty faculty;
    @ManyToOne
    private Subject subject;
    @ElementCollection
    private List<Integer> kurs;


    public FacultySubject(Faculty faculty, Subject subject) {
        this.faculty = faculty;
        this.subject = subject;
    }
}
