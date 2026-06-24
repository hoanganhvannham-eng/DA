package com.library.borrow.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "rental_rates")
@Getter
@Setter
@NoArgsConstructor
public class RentalRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private java.util.UUID id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "min_days", nullable = false)
    private Integer minDays;

    @Column(name = "max_days", nullable = false)
    private Integer maxDays;

    @Column(name = "fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal fee;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
