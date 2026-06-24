package com.library.shipping.domain.entity;

import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "shipping_orders", indexes = {
    @Index(name = "idx_shipping_orders_borrow_type", columnList = "borrow_record_id, shipping_type"),
    @Index(name = "idx_shipping_orders_status_created", columnList = "status, created_at"),
    @Index(name = "idx_shipping_orders_created_by", columnList = "created_by")
})
@Getter
@Setter
@NoArgsConstructor
public class ShippingOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "borrow_record_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID borrowRecordId;

    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_type", nullable = false, length = 20)
    private ShippingType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ShippingOrderStatus status;

    @Column(name = "tracking_number", nullable = false, length = 40, unique = true)
    private String trackingNumber;

    @Column(name = "shipping_address", nullable = false, length = 255)
    private String shippingAddress;

    @Column(name = "carrier", nullable = false, length = 50)
    private String carrier = "MOCK_CARRIER";

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber = 1;

    @Column(name = "estimated_delivery_date")
    private Instant estimatedDeliveryDate;

    @Column(name = "picked_up_at")
    private Instant pickedUpAt;

    @Column(name = "in_transit_at")
    private Instant inTransitAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "failed_at")
    private Instant failedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "created_by", nullable = false, columnDefinition = "BINARY(16)")
    private UUID createdBy;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.carrier == null) this.carrier = "MOCK_CARRIER";
        if (this.attemptNumber == null) this.attemptNumber = 1;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
