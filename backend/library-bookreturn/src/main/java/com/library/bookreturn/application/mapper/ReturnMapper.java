package com.library.bookreturn.application.mapper;

import com.library.bookreturn.presentation.dto.response.ConfirmReturnResponse;
import com.library.bookreturn.presentation.dto.response.CreateReturnResponse;
import com.library.bookreturn.presentation.dto.response.CreateReturnShipmentResponse;
import com.library.bookreturn.presentation.dto.response.FineTicketDTO;
import com.library.bookreturn.presentation.dto.response.PendingReturnDTO;
import com.library.bookreturn.presentation.dto.response.ResolveReturnLostResponse;
import com.library.bookreturn.presentation.dto.response.ReturnShippingIssueDTO;
import com.library.bookreturn.presentation.dto.response.ReturnShippingRequestedDTO;
import com.library.borrow.domain.entity.BorrowRecord;
import com.library.fine.domain.entity.FineTicket;
import com.library.shipping.domain.entity.ShippingOrder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReturnMapper {

    public CreateReturnResponse toCreateResponse(BorrowRecord record, String message) {
        return CreateReturnResponse.builder()
                .message(message)
                .borrowRecord(CreateReturnResponse.BorrowRecordDto.builder()
                        .id(record.getId())
                        .status(record.getStatus().name())
                        .returnMethod(record.getReturnMethod())
                        .pickupAddress(record.getPickupAddress())
                        .updatedAt(record.getUpdatedAt())
                        .build())
                .build();
    }

    public ConfirmReturnResponse toConfirmResponse(BorrowRecord record, String message, List<FineTicket> finesCreated) {
        ConfirmReturnResponse.BorrowRecordDto borrowDto = ConfirmReturnResponse.BorrowRecordDto.builder()
                .id(record.getId())
                .status(record.getStatus().name())
                .bookCondition(record.getBookCondition())
                .returnedAt(record.getReturnedAt())
                .confirmedBy(record.getConfirmedBy())
                .confirmedAt(record.getConfirmedAt())
                .build();

        List<FineTicketDTO> fineDTOs = finesCreated.stream()
                .map(this::toFineTicketDTO)
                .toList();

        return ConfirmReturnResponse.builder()
                .message(message)
                .borrowRecord(borrowDto)
                .finesCreated(fineDTOs)
                .build();
    }

    public PendingReturnDTO toPendingReturnDTO(
            BorrowRecord record, String readerName, String bookTitle) {
        return PendingReturnDTO.builder()
                .id(record.getId())
                .readerId(record.getReaderId())
                .readerName(readerName)
                .bookId(record.getBookId())
                .bookTitle(bookTitle)
                .status(record.getStatus().name())
                .returnMethod(record.getReturnMethod())
                .pickupAddress(record.getPickupAddress())
                .dueDate(record.getDueDate())
                .replacementPriceSnapshot(record.getReplacementPriceSnapshot())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    public FineTicketDTO toFineTicketDTO(FineTicket ticket) {
        return FineTicketDTO.builder()
                .id(ticket.getId())
                .fineType(ticket.getFineType().name())
                .amount(ticket.getAmount())
                .status(ticket.getStatus().name())
                .build();
    }

    public ReturnShippingRequestedDTO toReturnShippingRequestedDTO(BorrowRecord record, String readerName, String bookTitle) {
        ReturnShippingRequestedDTO dto = new ReturnShippingRequestedDTO();
        dto.setBorrowId(record.getId());
        dto.setReaderId(record.getReaderId());
        dto.setReaderName(readerName);
        dto.setBookId(record.getBookId());
        dto.setBookTitle(bookTitle);
        dto.setReturnMethod(record.getReturnMethod());
        dto.setBorrowDate(record.getBorrowDate());
        dto.setDueDate(record.getDueDate());
        dto.setPickupAddress(record.getPickupAddress());
        dto.setReturnAttemptCount(record.getReturnAttemptCount());
        dto.setCreatedAt(record.getCreatedAt());
        return dto;
    }

    public ReturnShippingIssueDTO toReturnShippingIssueDTO(BorrowRecord record, String readerName, String bookTitle) {
        ReturnShippingIssueDTO dto = new ReturnShippingIssueDTO();
        dto.setBorrowId(record.getId());
        dto.setReaderId(record.getReaderId());
        dto.setReaderName(readerName);
        dto.setBookId(record.getBookId());
        dto.setBookTitle(bookTitle);
        dto.setReturnMethod(record.getReturnMethod());
        dto.setBorrowDate(record.getBorrowDate());
        dto.setDueDate(record.getDueDate());
        dto.setPickupAddress(record.getPickupAddress());
        dto.setStatus(record.getStatus());
        dto.setReturnAttemptCount(record.getReturnAttemptCount());
        dto.setUpdatedAt(record.getUpdatedAt());
        return dto;
    }

    public CreateReturnShipmentResponse toCreateReturnShipmentResponse(ShippingOrder order, BorrowRecord record) {
        CreateReturnShipmentResponse.ShippingOrderDto shippingDto = CreateReturnShipmentResponse.ShippingOrderDto.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .type(order.getType().name())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .attemptNumber(order.getAttemptNumber())
                .createdAt(order.getCreatedAt())
                .build();

        CreateReturnShipmentResponse.BorrowRecordDto borrowDto = CreateReturnShipmentResponse.BorrowRecordDto.builder()
                .id(record.getId())
                .status(record.getStatus().name())
                .build();

        return CreateReturnShipmentResponse.builder()
                .message("Tạo đơn vận chuyển trả thành công")
                .shippingOrder(shippingDto)
                .borrow(borrowDto)
                .build();
    }

    public ResolveReturnLostResponse toResolveReturnLostResponse(BorrowRecord record, String message, List<FineTicket> finesCreated) {
        ResolveReturnLostResponse.BorrowRecordDto borrowDto = ResolveReturnLostResponse.BorrowRecordDto.builder()
                .id(record.getId())
                .status(record.getStatus().name())
                .returnLostResolution(record.getReturnLostResolution())
                .investigationNote(record.getInvestigationNote())
                .returnedAt(record.getReturnedAt())
                .build();

        List<FineTicketDTO> fineDTOs = finesCreated != null
                ? finesCreated.stream().map(this::toFineTicketDTO).toList()
                : List.of();

        return ResolveReturnLostResponse.builder()
                .message(message)
                .borrowRecord(borrowDto)
                .finesCreated(fineDTOs)
                .build();
    }
}
