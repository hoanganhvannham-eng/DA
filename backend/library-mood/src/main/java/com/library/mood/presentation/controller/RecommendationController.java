package com.library.mood.presentation.controller;

import com.library.mood.presentation.dto.response.RecommendationsResponse;
import com.library.mood.application.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<RecommendationsResponse> getRecommendations(@RequestParam UUID moodId) {
        RecommendationsResponse response = recommendationService.getRecommendations(moodId);
        return ResponseEntity.ok(response);
    }
}
