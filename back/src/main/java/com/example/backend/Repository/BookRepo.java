package com.example.backend.Repository;

import com.example.backend.Entity.Book;
import com.example.backend.Entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookRepo extends JpaRepository<Book, Integer> {

    boolean existsByNameAndSubject(String name, Subject subject);

    @Query(value = "SELECT * FROM book WHERE subject_id = :subjectId", nativeQuery = true)
    List<Book> findBySubjectId(Integer subjectId);

    @Query(value = "SELECT * FROM book WHERE " +
            "(:title = '' OR LOWER(name) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:author = '' OR LOWER(author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:publisher = '' OR LOWER(publisher) LIKE LOWER(CONCAT('%', :publisher, '%')))",
            nativeQuery = true)
    Page<Book> findAllByTitleAuthorPublisher(
            String title,
            String author,
            String publisher,
            Pageable pageable
    );


    // Jami kitoblar
    long count();

    // So‘nggi 7 kun ichida qo‘shilgan kitoblar
    @Query("SELECT COUNT(b) FROM Book b WHERE b.createdAt >= :date")
    long countBooksAfter(LocalDateTime date);

    // Fan bo‘yicha kitoblar soni
    @Query("SELECT b.subject.id, COUNT(b) FROM Book b GROUP BY b.subject.id")
    List<Object[]> countBooksBySubject();

    @Query("select b from Book b order by b.createdAt desc")
    List<Book> findAllOrderByCreatedAt();


    @Query("""
        SELECT fs.faculty.id,
               COUNT(b.id),
               COALESCE(SUM(b.libraryCount), 0)
        FROM Book b
        JOIN FacultySubject fs ON fs.subject.id = b.subject.id
        GROUP BY fs.faculty.id
    """)
    List<Object[]> countBooksAndLibraryByFaculty();



    @Query("""
        SELECT b.subject.id,
               COUNT(b.id),
               COALESCE(SUM(b.libraryCount), 0)
        FROM Book b
        WHERE b.subject.id IN :subjectIds
        GROUP BY b.subject.id
    """)
    List<Object[]> countBooksBySubjectIds(@Param("subjectIds") List<Integer> subjectIds);

}
