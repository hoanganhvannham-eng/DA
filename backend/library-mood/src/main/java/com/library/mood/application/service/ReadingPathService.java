package com.library.mood.application.service;

import com.library.mood.presentation.dto.response.GeneratedPathResponse;
import com.library.mood.presentation.dto.response.ReadingPathDTO;
import com.library.mood.domain.exception.InsufficientBooksForPathException;
import com.library.mood.domain.exception.MoodNotFoundException;
import com.library.mood.domain.exception.ReadingPathInvalidBooksException;
import com.library.mood.domain.exception.ReadingPathItemsInvalidException;
import com.library.mood.domain.ReadingPath;
import com.library.mood.domain.ReadingPathItem;
import com.library.mood.application.mapper.ReadingPathMapper;
import com.library.mood.infrastructure.persistence.MoodRepository;
import com.library.mood.infrastructure.persistence.ReadingPathItemRepository;
import com.library.mood.infrastructure.persistence.ReadingPathRepository;
import com.library.mood.infrastructure.persistence.RecommendationRepository;
import com.library.mood.presentation.dto.request.SaveReadingPathItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingPathService {

    private final ReadingPathRepository readingPathRepository;
    private final ReadingPathItemRepository readingPathItemRepository;
    private final MoodRepository moodRepository;
    private final RecommendationRepository recommendationRepository;
    private final ReadingPathMapper readingPathMapper;

    private static final int MIN_PATH_SIZE = 3;
    private static final int MAX_PATH_SIZE = 7;

    @Transactional(readOnly = true)
    public GeneratedPathResponse generatePath(UUID moodId, List<Recommendation> suggestions) {
        moodRepository.findById(moodId)
                .orElseThrow(MoodNotFoundException::new);

        if (suggestions.size() < MIN_PATH_SIZE) {
            log.warn("Cannot generate path for moodId={}: only {} books available", moodId, suggestions.size());
            throw new InsufficientBooksForPathException();
        }

        int count = Math.min(suggestions.size(), MAX_PATH_SIZE);
        List<GeneratedPathResponse.GeneratedBookItem> books = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            Recommendation rec = suggestions.get(i);
            books.add(GeneratedPathResponse.GeneratedBookItem.builder()
                    .id(rec.id())
                    .title(rec.title())
                    .author(rec.author())
                    .order(i + 1)
                    .build());
        }

        log.info("Generated reading path for moodId={}: {} books", moodId, books.size());

        return GeneratedPathResponse.builder()
                .moodId(moodId)
                .books(books)
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<ReadingPath> findExistingPath(UUID readerId, UUID moodId) {
        return readingPathRepository.findByReaderIdAndMoodId(readerId, moodId);
    }

    @Transactional
    public ReadingPathDTO savePath(UUID readerId, UUID moodId, List<SaveReadingPathItem> items) {
        if (items.size() < MIN_PATH_SIZE || items.size() > MAX_PATH_SIZE) {
            throw new ReadingPathItemsInvalidException();
        }

        moodRepository.findById(moodId)
                .orElseThrow(MoodNotFoundException::new);

        Set<UUID> bookIds = items.stream()
                .map(SaveReadingPathItem::getBookId)
                .collect(Collectors.toSet());

        List<UUID> existingBookIds = recommendationRepository.findExistingBookIds(bookIds);
        if (existingBookIds.size() != bookIds.size()) {
            log.warn("Invalid book IDs in reading path: requested={}, existing={}", bookIds.size(), existingBookIds.size());
            throw new ReadingPathInvalidBooksException();
        }

        readingPathRepository.findByReaderIdAndMoodId(readerId, moodId).ifPresent(existingPath -> {
            readingPathItemRepository.deleteByReadingPathId(existingPath.getId());
            readingPathRepository.deleteById(existingPath.getId());
            log.info("Replaced existing reading path: {}", existingPath.getId());
        });

        ReadingPath path = new ReadingPath();
        path.setReaderId(readerId);
        path.setMoodId(moodId);
        ReadingPath savedPath = readingPathRepository.save(path);

        List<ReadingPathItem> pathItems = new ArrayList<>();
        for (SaveReadingPathItem item : items) {
            ReadingPathItem pathItem = new ReadingPathItem();
            pathItem.setReadingPathId(savedPath.getId());
            pathItem.setBookId(item.getBookId());
            pathItem.setOrder(item.getOrder());
            pathItems.add(pathItem);
        }

        List<ReadingPathItem> savedItems = readingPathItemRepository.saveAll(pathItems);

        log.info("Reading path saved: id={}, readerId={}, moodId={}, items={}",
                savedPath.getId(), readerId, moodId, savedItems.size());

        List<ReadingPathDTO.PathItemDTO> itemDTOs = savedItems.stream()
                .map(readingPathMapper::toItemResponse)
                .toList();

        return ReadingPathDTO.builder()
                .id(savedPath.getId())
                .readerId(savedPath.getReaderId())
                .moodId(savedPath.getMoodId())
                .items(itemDTOs)
                .build();
    }

    public record Recommendation(UUID id, String title, String author) {
    }
}
