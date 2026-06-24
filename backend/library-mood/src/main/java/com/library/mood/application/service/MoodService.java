package com.library.mood.application.service;

import com.library.mood.presentation.dto.response.MoodListResponse;
import com.library.mood.presentation.dto.response.MoodResponse;
import com.library.mood.presentation.dto.request.CreateMoodRequest;
import com.library.mood.presentation.dto.request.UpdateMoodRequest;
import com.library.mood.domain.exception.InvalidMoodIdsException;
import com.library.mood.domain.exception.MoodAssignedDeleteForbiddenException;
import com.library.mood.domain.exception.MoodDuplicateNameException;
import com.library.mood.domain.exception.MoodNotFoundException;
import com.library.mood.domain.Mood;
import com.library.mood.application.mapper.MoodMapper;
import com.library.mood.infrastructure.persistence.BookMoodMappingRepository;
import com.library.mood.infrastructure.persistence.MoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoodService {

    private final MoodRepository moodRepository;
    private final BookMoodMappingRepository bookMoodMappingRepository;
    private final MoodMapper moodMapper;

    @Transactional(readOnly = true)
    public MoodListResponse listMoods() {
        List<MoodResponse> responses = moodRepository.findAllByOrderByNameAsc()
                .stream()
                .map(moodMapper::toResponse)
                .toList();

        return MoodListResponse.builder()
                .moods(responses)
                .build();
    }

    @Transactional
    public MoodResponse createMood(CreateMoodRequest request) {
        String trimmedName = request.getName().trim();

        moodRepository.findByNameIgnoreCase(trimmedName)
                .ifPresent(existing -> {
                    log.warn("Mood name already exists: '{}'", trimmedName);
                    throw new MoodDuplicateNameException();
                });

        Mood mood = new Mood();
        mood.setName(trimmedName);
        mood.setDescription(request.getDescription());
        Mood saved = moodRepository.save(mood);

        log.info("Mood created: id={}, name='{}'", saved.getId(), saved.getName());

        return moodMapper.toResponse(saved);
    }

    @Transactional
    public MoodResponse updateMood(UUID moodId, UpdateMoodRequest request) {
        Mood mood = moodRepository.findById(moodId)
                .orElseThrow(MoodNotFoundException::new);

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String trimmedName = request.getName().trim();

            moodRepository.findByNameIgnoreCaseAndIdNot(trimmedName, moodId)
                    .ifPresent(existing -> {
                        log.warn("Mood name already exists for another mood: '{}'", trimmedName);
                        throw new MoodDuplicateNameException();
                    });

            mood.setName(trimmedName);
        }

        if (request.getDescription() != null) {
            mood.setDescription(request.getDescription());
        }

        Mood saved = moodRepository.save(mood);

        log.info("Mood updated: id={}", moodId);

        return moodMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public void validateMoodIds(List<UUID> moodIds) {
        Set<UUID> uniqueIds = new HashSet<>(moodIds);
        List<UUID> existingIds = moodRepository.findIdsByIds(uniqueIds);

        if (existingIds.size() != uniqueIds.size()) {
            log.warn("Invalid mood IDs detected: requested={}, existing={}", uniqueIds.size(), existingIds.size());
            throw new InvalidMoodIdsException();
        }
    }

    @Transactional
    public void deleteMood(UUID moodId) {
        moodRepository.findById(moodId)
                .orElseThrow(MoodNotFoundException::new);

        long assignedCount = bookMoodMappingRepository.countByMoodId(moodId);
        if (assignedCount > 0) {
            log.warn("Cannot delete mood id={} — has {} book mapping(s)", moodId, assignedCount);
            throw new MoodAssignedDeleteForbiddenException();
        }

        moodRepository.deleteById(moodId);

        log.info("Mood deleted: id={}", moodId);
    }
}
