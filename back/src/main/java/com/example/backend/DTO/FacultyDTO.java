package com.example.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FacultyDTO {

    private Integer id;
    private String code;
    private String name;

    // Foreign key sifatida
    private Integer educationTypeId;
}
