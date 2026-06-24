package com.library.mood.application.service;

import com.library.mood.application.dto.BookRecommendation;
import com.library.mood.presentation.dto.response.RecommendationDTO;
import com.library.mood.presentation.dto.response.RecommendationsResponse;
import com.library.mood.domain.exception.MoodNotFoundException;
import com.library.mood.infrastructure.persistence.MoodRepository;
import com.library.mood.infrastructure.persistence.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MoodRepository moodRepository;
    private final RecommendationRepository recommendationRepository;

    @Transactional(readOnly = true)
    public RecommendationsResponse getRecommendations(UUID moodId) {
        moodRepository.findById(moodId)
                .orElseThrow(MoodNotFoundException::new);

        List<BookRecommendation> books = recommendationRepository.findBooksByMoodOrderByPopularity(moodId);

        List<RecommendationDTO> suggestions = books.stream()
                .map(book -> RecommendationDTO.builder()
                        .id(book.id())
                        .title(book.title())
                        .author(book.author())
                        .categoryName(book.categoryName())
                        .popularityScore(book.popularityScore())
                        .build())
                .toList();

        String message = suggestions.isEmpty() ? "Chưa có sách phù hợp với mood này" : null;

        log.info("Recommendations for moodId={}: {} books found", moodId, suggestions.size());

        return RecommendationsResponse.builder()
                .suggestions(suggestions)
                .message(message)
                .build();
    }
}
