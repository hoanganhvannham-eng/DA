package com.library.book.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "books", indexes = {
    @Index(name = "idx_books_category_id", columnList = "category_id"),
    @Index(name = "idx_books_isbn", columnList = "isbn"),
    @Index(name = "idx_books_is_deleted", columnList = "is_deleted")
})
@Getter
@Setter
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "author", nullable = false, length = 100)
    private String author;

    @Column(name = "published_year", nullable = false)
    private Integer publishedYear;

    @Column(name = "isbn", length = 20)
    private String isbn;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(name = "borrowed_quantity", nullable = false)
    private Integer borrowedQuantity = 0;

    @Column(name = "damaged_count", nullable = false)
    private Integer damagedCount = 0;

    @Column(name = "lost_count", nullable = false)
    private Integer lostCount = 0;

    @Column(name = "replacement_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal replacementPrice = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deposit_policy_id", nullable = false)
    private DepositPolicy depositPolicy;

    @Column(name = "custom_deposit_rate")
    private Integer customDepositRate;

    @Column(name = "image_key", length = 255)
    private String imageKey;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isDeleted == null) this.isDeleted = false;
        if (this.borrowedQuantity == null) this.borrowedQuantity = 0;
        if (this.damagedCount == null) this.damagedCount = 0;
        if (this.lostCount == null) this.lostCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
