package com.library.mood.presentation.controller;

import com.library.mood.presentation.dto.response.GeneratedPathResponse;
import com.library.mood.presentation.dto.response.ReadingPathDTO;
import com.library.mood.presentation.dto.response.RecommendationsResponse;
import com.library.mood.application.service.ReadingPathService;
import com.library.mood.application.service.RecommendationService;
import com.library.mood.presentation.dto.request.GenerateReadingPathRequest;
import com.library.mood.presentation.dto.request.SaveReadingPathRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reading-paths")
@RequiredArgsConstructor
public class ReadingPathController {

    private final ReadingPathService readingPathService;
    private final RecommendationService recommendationService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<GeneratedPathResponse> generate(
            @Valid @RequestBody GenerateReadingPathRequest request) {

        RecommendationsResponse suggestions = recommendationService.getRecommendations(request.getMoodId());

        List<ReadingPathService.Recommendation> recs = suggestions.getSuggestions().stream()
                .map(dto -> new ReadingPathService.Recommendation(
                        dto.getId(),
                        dto.getTitle(),
                        dto.getAuthor()))
                .toList();

        GeneratedPathResponse response = readingPathService.generatePath(request.getMoodId(), recs);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<?> save(
            @Valid @RequestBody SaveReadingPathRequest request,
            Authentication authentication) {

        UUID readerId = UUID.fromString((String) authentication.getPrincipal());

        boolean pathExists = readingPathService.findExistingPath(readerId, request.getMoodId()).isPresent();

        if (pathExists && !Boolean.TRUE.equals(request.getConfirmReplace())) {
            return ResponseEntity.ok(Map.of(
                    "confirmReplace", true,
                    "message", "Bạn đã có lộ trình cho mood này. Tạo mới sẽ thay thế lộ trình cũ. Tiếp tục?"
            ));
        }

        ReadingPathDTO result = readingPathService.savePath(readerId, request.getMoodId(), request.getItems());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Lưu lộ trình đọc thành công",
                "path", result
        ));
    }
}
