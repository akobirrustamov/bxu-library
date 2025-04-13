package com.example.backend.Repository;

import com.example.backend.Entity.Audio;
import com.example.backend.Entity.Badiiy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AudioRepo extends JpaRepository<Audio, Integer> {

    @Query("SELECT a FROM Audio a WHERE " +
            "(:title = '' OR LOWER(a.name) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:author = '' OR LOWER(a.author) LIKE LOWER(CONCAT('%', :author, '%')))")
    Page<Audio> findAllByTitleAndAuthor(
            String title,
            String author,
            Pageable pageable);
}
