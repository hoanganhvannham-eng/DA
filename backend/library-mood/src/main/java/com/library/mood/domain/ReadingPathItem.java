package com.library.mood.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reading_path_items")
@Getter
@Setter
@NoArgsConstructor
public class ReadingPathItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "reading_path_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID readingPathId;

    @Column(name = "book_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID bookId;

    @Column(name = "sort_order", nullable = false)
    private Integer order;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
