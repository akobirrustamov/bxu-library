package com.example.backend.Repository;

import com.example.backend.Entity.Book;
import com.example.backend.Entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookRepo extends JpaRepository<Book, Integer> {
    boolean existsByNameAndSubject(String name, Subject subject);
    @Query(value = "select * from book where subject_id=:subjectId", nativeQuery = true)
    List<Book> findBySubjectId(Integer subjectId);

    @Query(value = "SELECT * FROM book WHERE " +
            "(:title IS NULL OR LOWER(name) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:author IS NULL OR LOWER(author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:publisher IS NULL OR LOWER(publisher) LIKE LOWER(CONCAT('%', :publisher, '%')))",

            nativeQuery = true)
    Page<Book> findAllByTitleAuthorPublisher(String title, String author, String publisher, Pageable pageable);



}
