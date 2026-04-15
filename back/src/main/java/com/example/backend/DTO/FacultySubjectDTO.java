package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FacultySubjectDTO {

    private Integer id;
    private Integer facultyId;
    private Integer subjectId;
    private Integer kurs;

    // ixtiyoriy (frontend uchun qulay)
    private String facultyName;
    private String subjectName;
    private String description;
    private Long bookCount;
}
