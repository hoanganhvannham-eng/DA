package com.library.book.presentation.controller;

import com.library.book.application.service.BookQueryService;
import com.library.book.application.service.BookService;
import com.library.book.domain.enums.BookSortOption;
import com.library.book.presentation.dto.request.BookRequest;
import com.library.book.presentation.dto.response.BookDetailResponse;
import com.library.book.presentation.dto.response.BookListResponse;
import com.library.book.presentation.dto.response.BookMutationResponse;
import com.library.book.presentation.dto.response.MessageResponse;
import com.library.mood.presentation.dto.response.BookMoodsResponse;
import com.library.mood.presentation.dto.response.MoodResponse;
import com.library.mood.application.service.BookMoodMappingService;
import com.library.mood.application.service.MoodService;
import com.library.mood.presentation.dto.request.AssignMoodsRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final BookQueryService bookQueryService;
    private final BookMoodMappingService bookMoodMappingService;
    private final MoodService moodService;

    @GetMapping
    public ResponseEntity<BookListResponse> listBooks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "name_asc") BookSortOption sort) {

        BookListResponse response = bookQueryService.listBooks(page, search, categoryId, sort);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<BookDetailResponse> getBookDetail(
            @PathVariable UUID bookId,
            Authentication authentication) {

        String role = extractRole(authentication);
        BookDetailResponse response = bookQueryService.getBookDetail(bookId, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BookMutationResponse> createBook(
            @Valid @RequestBody BookRequest request) {

        BookMutationResponse response = bookService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{bookId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BookMutationResponse> updateBook(
            @PathVariable UUID bookId,
            @Valid @RequestBody BookRequest request) {

        BookMutationResponse response = bookService.updateBook(bookId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<MessageResponse> deleteBook(@PathVariable UUID bookId) {
        MessageResponse response = bookService.deleteBook(bookId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookId}/moods")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BookMoodsResponse> getBookMoods(@PathVariable UUID bookId) {
        List<MoodResponse> availableMoods = moodService.listMoods().getMoods();
        List<UUID> currentMoodIds = bookMoodMappingService.getCurrentMoods(bookId);

        return ResponseEntity.ok(BookMoodsResponse.builder()
                .availableMoods(availableMoods)
                .currentMoodIds(currentMoodIds)
                .build());
    }

    @PutMapping("/{bookId}/moods")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateBookMoods(
            @PathVariable UUID bookId,
            @Valid @RequestBody AssignMoodsRequest request) {

        bookMoodMappingService.updateBookMoods(bookId, request.getMoodIds());

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật mood cho sách thành công",
                "moodIds", request.getMoodIds()
        ));
    }

    @PostMapping("/{bookId}/cover")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadCover(
            @PathVariable UUID bookId,
            @RequestPart("cover_image") MultipartFile file) {

        String imageUrl = bookService.updateCover(bookId, file);

        return ResponseEntity.ok(Map.of(
                "imageUrl", imageUrl
        ));
    }

    @DeleteMapping("/{bookId}/cover")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Void> deleteCover(@PathVariable UUID bookId) {
        bookService.deleteCover(bookId);
        return ResponseEntity.noContent().build();
    }

    private String extractRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse(null);
    }
}
