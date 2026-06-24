package com.library.fine.presentation.controller;

import com.library.fine.application.service.FineLevelService;
import com.library.fine.presentation.dto.request.CreateFineLevelRequest;
import com.library.fine.presentation.dto.request.UpdateFineLevelRequest;
import com.library.fine.presentation.dto.response.FineLevelListResponse;
import com.library.fine.presentation.dto.response.FineLevelResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fine-levels")
@RequiredArgsConstructor
public class FineLevelController {

    private final FineLevelService fineLevelService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<FineLevelListResponse> getAllFineLevels(
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(fineLevelService.getAllFineLevels(type));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineLevelResponse> createFineLevel(@Valid @RequestBody CreateFineLevelRequest request) {
        FineLevelResponse response = fineLevelService.createFineLevel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{fineLevelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineLevelResponse> updateFineLevel(
            @PathVariable UUID fineLevelId,
            @Valid @RequestBody UpdateFineLevelRequest request) {

        FineLevelResponse response = fineLevelService.updateFineLevel(fineLevelId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{fineLevelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFineLevel(@PathVariable UUID fineLevelId) {
        fineLevelService.deleteFineLevel(fineLevelId);
        return ResponseEntity.ok(Map.of("message", "Xóa mức phạt thành công"));
    }
}
