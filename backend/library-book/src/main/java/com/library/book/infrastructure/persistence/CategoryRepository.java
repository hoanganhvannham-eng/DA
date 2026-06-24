package com.library.book.infrastructure.persistence;

import com.library.book.domain.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByNameIgnoreCase(String name);

    Optional<Category> findByNameIgnoreCaseAndIdNot(String name, UUID id);

    List<Category> findAllByOrderByNameAsc();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.category.id = :categoryId AND b.isDeleted = false")
    long countActiveBooksByCategoryId(@Param("categoryId") UUID categoryId);
}
