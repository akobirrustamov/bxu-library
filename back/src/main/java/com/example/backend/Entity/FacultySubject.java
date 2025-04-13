package com.example.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    Faculty faculty;
    @ManyToOne
    Subject subject;

    public FacultySubject(Faculty faculty, Subject subject) {
        this.faculty = faculty;
        this.subject = subject;
    }
}
