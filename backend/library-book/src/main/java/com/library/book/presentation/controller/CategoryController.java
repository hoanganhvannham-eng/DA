package com.library.book.presentation.controller;

import com.library.book.application.service.CategoryService;
import com.library.book.presentation.dto.request.CategoryRequest;
import com.library.book.presentation.dto.response.CategoryListResponse;
import com.library.book.presentation.dto.response.CategoryMutationResponse;
import com.library.book.presentation.dto.response.MessageResponse;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<CategoryListResponse> getAllCategories() {
        CategoryListResponse response = categoryService.getAllCategories();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<CategoryMutationResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        CategoryMutationResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<CategoryMutationResponse> updateCategory(
            @PathVariable UUID categoryId,
            @Valid @RequestBody CategoryRequest request) {

        CategoryMutationResponse response = categoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<MessageResponse> deleteCategory(
            @PathVariable UUID categoryId) {

        MessageResponse response = categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(response);
    }
}
