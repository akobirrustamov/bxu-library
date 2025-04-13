package com.example.backend.Controller;

import com.example.backend.Entity.Faculty;
import com.example.backend.Repository.FacultyRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/faculty")
public class FacultyController {

    private final FacultyRepo facultyRepo;

    @GetMapping("/{education}")
    public HttpEntity<?> findAll(@PathVariable Integer education) {
        List<Faculty> all = facultyRepo.findAllByEducationType(education);
        return ResponseEntity.ok(all);

    }

}
