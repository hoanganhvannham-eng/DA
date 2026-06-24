package com.library.mood.presentation.validation;

import com.library.mood.infrastructure.persistence.MoodRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
public class ValidMoodIdsValidator implements ConstraintValidator<ValidMoodIds, List<UUID>> {

    private final MoodRepository moodRepository;

    public ValidMoodIdsValidator(MoodRepository moodRepository) {
        this.moodRepository = moodRepository;
    }

    @Override
    public boolean isValid(List<UUID> value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return true;
        }
        Set<UUID> uniqueIds = new HashSet<>(value);
        List<UUID> existingIds = moodRepository.findIdsByIds(uniqueIds);
        return existingIds.size() == uniqueIds.size();
    }
}
