package com.library.book.application.service;

import com.library.book.application.mapper.CategoryMapper;
import com.library.book.domain.exception.CategoryHasBooksException;
import com.library.book.domain.exception.CategoryNameAlreadyExistsException;
import com.library.book.domain.exception.CategoryNotFoundException;
import com.library.book.domain.entity.Category;
import com.library.book.infrastructure.persistence.CategoryRepository;
import com.library.book.presentation.dto.request.CategoryRequest;
import com.library.book.presentation.dto.response.CategoryListResponse;
import com.library.book.presentation.dto.response.CategoryMutationResponse;
import com.library.book.presentation.dto.response.CategoryResponse;
import com.library.book.presentation.dto.response.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public CategoryListResponse getAllCategories() {
        List<CategoryResponse> responses = categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();

        log.debug("Fetched {} categories", responses.size());

        return CategoryListResponse.builder()
                .categories(responses)
                .build();
    }

    @Transactional
    public CategoryMutationResponse createCategory(CategoryRequest request) {
        String trimmedName = request.getName().trim();

        categoryRepository.findByNameIgnoreCase(trimmedName)
                .ifPresent(existing -> {
                    log.warn("Category name already exists: '{}'", trimmedName);
                    throw new CategoryNameAlreadyExistsException();
                });

        Category category = new Category();
        category.setName(trimmedName);
        Category saved = categoryRepository.save(category);

        log.info("Category created: id={}, name='{}'", saved.getId(), saved.getName());

        return CategoryMutationResponse.builder()
                .message("Thêm thể loại thành công")
                .category(categoryMapper.toResponse(saved))
                .build();
    }

    @Transactional
    public CategoryMutationResponse updateCategory(UUID categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(CategoryNotFoundException::new);

        String trimmedName = request.getName().trim();

        categoryRepository.findByNameIgnoreCaseAndIdNot(trimmedName, categoryId)
                .ifPresent(existing -> {
                    log.warn("Category name already exists for another category: '{}'", trimmedName);
                    throw new CategoryNameAlreadyExistsException();
                });

        String oldName = category.getName();
        category.setName(trimmedName);
        Category saved = categoryRepository.save(category);

        log.info("Category updated: id={}, '{}' → '{}'", categoryId, oldName, trimmedName);

        return CategoryMutationResponse.builder()
                .message("Cập nhật thể loại thành công")
                .category(categoryMapper.toResponse(saved))
                .build();
    }

    @Transactional
    public MessageResponse deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(CategoryNotFoundException::new);

        long activeBookCount = categoryRepository.countActiveBooksByCategoryId(categoryId);
        if (activeBookCount > 0) {
            log.warn("Cannot delete category id={} — has {} active book(s)", categoryId, activeBookCount);
            throw new CategoryHasBooksException();
        }

        categoryRepository.delete(category);
        log.info("Category deleted: id={}, name='{}'", categoryId, category.getName());

        return MessageResponse.builder()
                .message("Xóa thể loại thành công")
                .build();
    }
}
