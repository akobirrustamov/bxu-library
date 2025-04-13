package com.example.backend.Controller;

import com.example.backend.Entity.FacultySubject;
import com.example.backend.Entity.Subject;
import com.example.backend.Repository.FacultySubjectRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/faculty-subject")
public class FacultySubjectController {
    private final FacultySubjectRepo facultySubjectRepo;


    @GetMapping("/{facultyId}")
    public HttpEntity<?> getFacultySubjects(@PathVariable Integer facultyId) {
        System.out.println(facultyId);
        List<FacultySubject> facultySubjects= facultySubjectRepo.findAllSubjectsByFacultyId(facultyId);
        return ResponseEntity.ok(facultySubjects);
    }
}
