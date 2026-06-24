package com.library.shipping.domain.entity;

import com.library.shipping.domain.enums.ShippingOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipping_status_logs", indexes = {
    @Index(name = "idx_shipping_status_logs_order_changed", columnList = "shipping_order_id, changed_at")
})
@Getter
@Setter
@NoArgsConstructor
public class ShippingStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "shipping_order_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID shippingOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private ShippingOrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private ShippingOrderStatus toStatus;

    @Column(name = "changed_by", nullable = false, length = 20)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.changedAt == null) this.changedAt = Instant.now();
    }
}
