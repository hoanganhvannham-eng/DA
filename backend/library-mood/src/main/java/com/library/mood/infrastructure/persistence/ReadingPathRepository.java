package com.library.mood.infrastructure.persistence;

import com.library.mood.domain.ReadingPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReadingPathRepository extends JpaRepository<ReadingPath, UUID> {

    Optional<ReadingPath> findByReaderIdAndMoodId(UUID readerId, UUID moodId);
}
