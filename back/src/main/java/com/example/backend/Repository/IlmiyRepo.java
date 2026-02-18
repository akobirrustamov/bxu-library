package com.example.backend.Repository;

import com.example.backend.Entity.Ilmiy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface IlmiyRepo extends JpaRepository<Ilmiy, Integer> {

    @Query("""
        SELECT i FROM Ilmiy i
        WHERE (:mavzu IS NULL OR LOWER(i.mavzu) LIKE LOWER(CONCAT('%', :mavzu, '%')))
        AND (:ixtisosligi IS NULL OR LOWER(i.ixtisosligi) LIKE LOWER(CONCAT('%', :ixtisosligi, '%')))
        AND (:author IS NULL OR LOWER(i.author) LIKE LOWER(CONCAT('%', :author, '%')))
        AND (:genre IS NULL OR LOWER(i.genre) LIKE LOWER(CONCAT('%', :genre, '%')))
        AND (:isHaveLibrary IS NULL OR i.isHaveLibrary = :isHaveLibrary)
        AND (:createdAt IS NULL OR FUNCTION('DATE', i.createdAt) = :createdAt)
    """)
    List<Ilmiy> filter(
            @Param("mavzu") String mavzu,
            @Param("ixtisosligi") String ixtisosligi,
            @Param("author") String author,
            @Param("genre") String genre,
            @Param("isHaveLibrary") Boolean isHaveLibrary,
            @Param("createdAt") LocalDate createdAt
    );
}