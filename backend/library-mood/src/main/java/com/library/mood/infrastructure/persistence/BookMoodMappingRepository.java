package com.library.mood.infrastructure.persistence;

import com.library.mood.domain.BookMoodMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookMoodMappingRepository extends JpaRepository<BookMoodMapping, BookMoodMapping.BookMoodMappingId> {

    long countByMoodId(UUID moodId);

    List<BookMoodMapping> findByBookId(UUID bookId);

    void deleteByBookId(UUID bookId);
}
