package com.library.mood.application.service;

import com.library.mood.domain.BookMoodMapping;
import com.library.mood.infrastructure.persistence.BookMoodMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookMoodMappingService {

    private final BookMoodMappingRepository bookMoodMappingRepository;

    @Transactional(readOnly = true)
    public List<UUID> getCurrentMoods(UUID bookId) {
        return bookMoodMappingRepository.findByBookId(bookId)
                .stream()
                .map(BookMoodMapping::getMoodId)
                .toList();
    }

    @Transactional
    public void updateBookMoods(UUID bookId, List<UUID> moodIds) {
        bookMoodMappingRepository.deleteByBookId(bookId);

        List<BookMoodMapping> newMappings = moodIds.stream()
                .map(moodId -> {
                    BookMoodMapping mapping = new BookMoodMapping();
                    mapping.setBookId(bookId);
                    mapping.setMoodId(moodId);
                    mapping.setCreatedAt(Instant.now());
                    return mapping;
                })
                .toList();

        bookMoodMappingRepository.saveAll(newMappings);

        log.info("Book moods updated: bookId={}, moodCount={}", bookId, moodIds.size());
    }
}
