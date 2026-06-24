package com.library.mood.presentation.controller;

import com.library.mood.presentation.dto.response.MoodListResponse;
import com.library.mood.presentation.dto.response.MoodResponse;
import com.library.mood.application.service.MoodService;
import com.library.mood.presentation.dto.request.CreateMoodRequest;
import com.library.mood.presentation.dto.request.UpdateMoodRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/moods")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;

    @GetMapping("/public")
    public ResponseEntity<MoodListResponse> listPublicMoods() {
        return ResponseEntity.ok(moodService.listMoods());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<MoodListResponse> listMoods() {
        return ResponseEntity.ok(moodService.listMoods());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<MoodResponse> createMood(@Valid @RequestBody CreateMoodRequest request) {
        MoodResponse response = moodService.createMood(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{moodId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<MoodResponse> updateMood(
            @PathVariable UUID moodId,
            @Valid @RequestBody UpdateMoodRequest request) {

        MoodResponse response = moodService.updateMood(moodId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{moodId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMood(@PathVariable UUID moodId) {
        moodService.deleteMood(moodId);
        return ResponseEntity.ok(Map.of("message", "Xóa mood thành công"));
    }
}
