package com.library.mood.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "book_mood_mappings")
@Getter
@Setter
@NoArgsConstructor
@IdClass(BookMoodMapping.BookMoodMappingId.class)
public class BookMoodMapping {

    @Id
    @Column(name = "book_id", columnDefinition = "BINARY(16)")
    private UUID bookId;

    @Id
    @Column(name = "mood_id", columnDefinition = "BINARY(16)")
    private UUID moodId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    @Getter
    @Setter
    public static class BookMoodMappingId implements Serializable {
        private UUID bookId;
        private UUID moodId;
    }
}
