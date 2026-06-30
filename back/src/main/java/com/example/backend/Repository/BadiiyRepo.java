package com.example.backend.Repository;

import com.example.backend.Entity.Badiiy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BadiiyRepo extends JpaRepository<Badiiy, Integer> {

    @Query("SELECT b FROM Badiiy b WHERE " +
            "(:query = '' OR LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY b.id DESC")
    Page<Badiiy> findAllByTitleAuthorPublisher(
            String query,
            Pageable pageable);
}
