package com.example.backend.Controller;

import com.example.backend.Entity.EducationType;
import com.example.backend.Repository.EducationTypeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin
@RequestMapping("/api/v1/type")
public class EducationTypeController {

    private final EducationTypeRepo educationTypeRepo;


    @GetMapping
    public HttpEntity<?> getEducationType(){
       List<EducationType> educationTypes = educationTypeRepo.findAll();
       return ResponseEntity.ok(educationTypes);
    }
}
