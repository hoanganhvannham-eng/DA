package com.library.fine.application.service;

import com.library.fine.domain.entity.FineLevel;
import com.library.fine.domain.exception.FineLevelDateInvalidException;
import com.library.fine.domain.exception.FineLevelInUseException;
import com.library.fine.domain.exception.FineLevelNotFoundException;
import com.library.fine.infrastructure.persistence.FineLevelRepository;
import com.library.fine.presentation.dto.request.CreateFineLevelRequest;
import com.library.fine.presentation.dto.request.UpdateFineLevelRequest;
import com.library.fine.presentation.dto.response.FineLevelListResponse;
import com.library.fine.presentation.dto.response.FineLevelResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FineLevelService {

    private final FineLevelRepository fineLevelRepository;

    @Transactional(readOnly = true)
    public FineLevelListResponse getAllFineLevels(String type) {
        List<FineLevel> levels;
        if (type != null && !type.isBlank()) {
            levels = fineLevelRepository.findByFineTypeOrAll(type);
        } else {
            levels = fineLevelRepository.findAllByOrderByCreatedAtDesc();
        }

        List<FineLevelResponse> responses = levels.stream()
                .map(this::toResponse)
                .toList();

        return FineLevelListResponse.builder()
                .fineLevels(responses)
                .build();
    }

    @Transactional
    public FineLevelResponse createFineLevel(CreateFineLevelRequest request) {
        LocalDate fineDate = request.getFineDate() != null ? request.getFineDate() : LocalDate.now();

        validateFineDate(fineDate);

        FineLevel fineLevel = new FineLevel();
        fineLevel.setName(request.getName().trim());
        fineLevel.setAmount(request.getAmount());
        fineLevel.setAmountPerDay(request.getAmountPerDay());
        fineLevel.setMaxAmount(request.getMaxAmount());
        fineLevel.setFineDate(fineDate);
        fineLevel.setFineType(request.getFineType() != null ? request.getFineType() : "ALL");

        FineLevel saved = fineLevelRepository.save(fineLevel);

        log.info("FineLevel created: id={}, name='{}', amount={}, fineType={}", saved.getId(), saved.getName(), saved.getAmount(), saved.getFineType());

        return toResponse(saved);
    }

    @Transactional
    public FineLevelResponse updateFineLevel(UUID fineLevelId, UpdateFineLevelRequest request) {
        FineLevel fineLevel = fineLevelRepository.findById(fineLevelId)
                .orElseThrow(FineLevelNotFoundException::new);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            fineLevel.setName(request.getName().trim());
        }

        if (request.getAmount() != null) {
            fineLevel.setAmount(request.getAmount());
        }

        if (request.getAmountPerDay() != null) {
            fineLevel.setAmountPerDay(request.getAmountPerDay());
        }

        if (request.getMaxAmount() != null) {
            fineLevel.setMaxAmount(request.getMaxAmount());
        }

        if (request.getFineDate() != null) {
            validateFineDate(request.getFineDate());
            fineLevel.setFineDate(request.getFineDate());
        }

        if (request.getFineType() != null && !request.getFineType().isBlank()) {
            fineLevel.setFineType(request.getFineType());
        }

        FineLevel saved = fineLevelRepository.save(fineLevel);

        log.info("FineLevel updated: id={}", fineLevelId);

        return toResponse(saved);
    }

    @Transactional
    public void deleteFineLevel(UUID fineLevelId) {
        fineLevelRepository.findById(fineLevelId)
                .orElseThrow(FineLevelNotFoundException::new);

        long refCount = fineLevelRepository.countRefsByFineLevelId(fineLevelId);
        if (refCount > 0) {
            log.warn("Cannot delete FineLevel id={} — referenced by {} fine ticket(s)", fineLevelId, refCount);
            throw new FineLevelInUseException();
        }

        fineLevelRepository.deleteById(fineLevelId);

        log.info("FineLevel deleted: id={}", fineLevelId);
    }

    private void validateFineDate(LocalDate fineDate) {
        LocalDate today = LocalDate.now();
        if (fineDate.isAfter(today) || fineDate.isBefore(today.minusDays(30))) {
            throw new FineLevelDateInvalidException();
        }
    }

    private FineLevelResponse toResponse(FineLevel level) {
        return FineLevelResponse.builder()
                .id(level.getId())
                .name(level.getName())
                .amount(level.getAmount())
                .amountPerDay(level.getAmountPerDay())
                .maxAmount(level.getMaxAmount())
                .fineType(level.getFineType())
                .fineDate(level.getFineDate())
                .createdAt(level.getCreatedAt())
                .updatedAt(level.getUpdatedAt())
                .build();
    }
}
