package com.library.mood.infrastructure.persistence;

import com.library.mood.domain.ReadingPathItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReadingPathItemRepository extends JpaRepository<ReadingPathItem, UUID> {

    List<ReadingPathItem> findByReadingPathId(UUID readingPathId);

    void deleteByReadingPathId(UUID readingPathId);
}
