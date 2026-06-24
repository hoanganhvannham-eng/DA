package com.library.shipping.application.service;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.dto.CreateShipmentResult;
import com.library.shipping.domain.port.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryConflictHandler {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;

    @Transactional
    public CreateShipmentResult handle(BorrowRecord borrow, UUID librarianId) {
        UUID bookId = borrow.getBookId();
        UUID borrowId = borrow.getId();

        log.warn("Inventory conflict: borrowId={}, bookId={} — book not found on shelf", borrowId, bookId);

        borrow.setStatus(BorrowStatus.DELIVERY_ISSUE);
        borrow.setIssueType("INVENTORY_CONFLICT");
        borrowRecordRepository.save(borrow);

        bookRepository.incrementStock(bookId);

        notificationService.notifyLibrarian(
                "Cần điều tra — sách bị thiếu trên kệ (borrowId: " + borrowId + ", bookId: " + bookId + ")",
                borrowId);
        notificationService.notifyReader(
                borrow.getReaderId(),
                "Đơn mượn đang được xử lý. Chúng tôi sẽ liên hệ với bạn sớm.");

        log.warn("Inventory conflict handled: borrowId={}, bookId={}, librarianId={}",
                borrowId, bookId, librarianId);

        CreateShipmentResult.BorrowStatusInfo borrowInfo = CreateShipmentResult.BorrowStatusInfo.builder()
                .id(borrow.getId())
                .status(BorrowStatus.DELIVERY_ISSUE.name())
                .build();

        return CreateShipmentResult.builder()
                .message("Sách không tìm thấy trên kệ. Đơn mượn chuyển sang trạng thái có vấn đề giao hàng")
                .borrow(borrowInfo)
                .build();
    }
}
