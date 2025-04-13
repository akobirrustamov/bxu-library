package com.example.backend.Repository;

import com.example.backend.Entity.Badiiy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BadiiyRepo extends JpaRepository<Badiiy, Integer> {

    @Query("SELECT b FROM Badiiy b WHERE " +
            "(:title = '' OR LOWER(b.name) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:author = '' OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:publisher = '' OR LOWER(b.publisher) LIKE LOWER(CONCAT('%', :publisher, '%')))")
    Page<Badiiy> findAllByTitleAuthorPublisher(
            String title,
            String author,
            String publisher,
            Pageable pageable);
}
