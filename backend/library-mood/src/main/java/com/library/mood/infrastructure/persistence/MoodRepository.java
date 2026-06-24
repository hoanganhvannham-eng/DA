package com.library.mood.infrastructure.persistence;

import com.library.mood.domain.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface MoodRepository extends JpaRepository<Mood, UUID> {

    Optional<Mood> findByNameIgnoreCase(String name);

    Optional<Mood> findByNameIgnoreCaseAndIdNot(String name, UUID id);

    List<Mood> findAllByOrderByNameAsc();

    @Query("SELECT m.id FROM Mood m WHERE m.id IN :ids")
    List<UUID> findIdsByIds(@Param("ids") Set<UUID> ids);
}
