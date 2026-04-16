package com.example.backend.Repository;

import com.example.backend.Entity.Shelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ShelfRepo extends JpaRepository<Shelf, Integer> {
    Optional<Shelf> findByName(String name);
    boolean existsByName(String name);
    List<Shelf> findAllByOrderByNameAsc();

    @Query("SELECT s.name FROM Shelf s ORDER BY s.name")
    List<String> findAllNamesOrderByNameAsc();
}
