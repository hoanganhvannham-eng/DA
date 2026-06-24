package com.library.fine.application.service;

import com.library.fine.domain.entity.FineLevel;
import com.library.fine.domain.entity.FineTicket;
import com.library.fine.domain.enums.FineStatus;
import com.library.fine.domain.exception.*;
import com.library.fine.infrastructure.persistence.FineLevelRepository;
import com.library.fine.infrastructure.persistence.FineTicketRepository;
import com.library.fine.infrastructure.persistence.IdempotencyKeyRepository;
import com.library.fine.presentation.dto.FineTicketDTO;
import com.library.fine.presentation.dto.response.PayFineResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinePaymentService {

    private final FineTicketRepository fineTicketRepository;
    private final FineLevelRepository fineLevelRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final FileStorageService fileStorageService;

    private static final long MAX_PROOF_SIZE = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png");

    @Transactional(readOnly = true)
    public List<FineTicketDTO> getReaderFines(UUID readerId) {
        List<FineTicket> tickets = fineTicketRepository.findByReaderIdOrderByCreatedAtDesc(readerId);

        Map<UUID, FineLevel> fineLevelMap = fineLevelRepository.findAll().stream()
                .collect(Collectors.toMap(FineLevel::getId, fl -> fl));

        return tickets.stream()
                .map(ticket -> toFineTicketDTO(ticket, fineLevelMap.get(ticket.getFineLevelId())))
                .toList();
    }

    @Transactional
    public PayFineResponse payFine(UUID fineId, UUID readerId, MultipartFile proofImage, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            var existing = idempotencyKeyRepository.findByKey(idempotencyKey);
            if (existing.isPresent()) {
                log.info("Idempotency key hit: {}", idempotencyKey);
                return PayFineResponse.builder()
                        .message("Yêu cầu đã được xử lý")
                        .build();
            }
        }

        FineTicket ticket = fineTicketRepository.findByIdAndReaderId(fineId, readerId)
                .orElseThrow(FineTicketNotFoundException::new);

        if (ticket.getStatus() == FineStatus.PENDING_CONFIRM) {
            throw new FinePaymentStatusNotAllowedException();
        }
        if (ticket.getStatus() == FineStatus.PAID) {
            throw new FinePaymentStatusNotAllowedException();
        }
        if (ticket.getStatus() == FineStatus.VOID) {
            throw new FinePaymentStatusNotAllowedException();
        }

        validateProofImage(proofImage);

        String proofUrl = fileStorageService.uploadFile(proofImage, "/fines/" + fineId + "/proof");

        ticket.setStatus(FineStatus.PENDING_CONFIRM);
        ticket.setPaymentProofUrl(proofUrl);
        ticket.setProofSubmittedAt(Instant.now());
        fineTicketRepository.save(ticket);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            try {
                var keyEntity = new com.library.fine.domain.entity.IdempotencyKey();
                keyEntity.setKey(idempotencyKey);
                keyEntity.setResponse("{\"status\":\"PENDING_CONFIRM\"}");
                idempotencyKeyRepository.save(keyEntity);
            } catch (DataIntegrityViolationException e) {
                log.info("Idempotency key duplicate (race): {}", idempotencyKey);
            }
        }

        log.info("Fine payment submitted: fineId={}, readerId={}", fineId, readerId);

        return PayFineResponse.builder()
                .message("Yêu cầu thanh toán đã được gửi, chờ xác nhận")
                .fine(PayFineResponse.FineInfo.builder()
                        .id(ticket.getId())
                        .status(ticket.getStatus().name())
                        .paymentProofUrl(proofUrl)
                        .proofSubmittedAt(ticket.getProofSubmittedAt())
                        .build())
                .build();
    }

    private void validateProofImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FineProofRequiredException();
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new FineProofFormatInvalidException();
        }
        if (file.getSize() > MAX_PROOF_SIZE) {
            throw new FineProofTooLargeException();
        }
    }

    private FineTicketDTO toFineTicketDTO(FineTicket ticket, FineLevel fineLevel) {
        return FineTicketDTO.builder()
                .id(ticket.getId())
                .cause(determineCause(ticket))
                .amount(ticket.getAmount())
                .remainingAmount(ticket.getRemainingAmount())
                .fineDate(fineLevel != null ? fineLevel.getFineDate() : null)
                .status(ticket.getStatus().name())
                .paymentProofUrl(ticket.getPaymentProofUrl())
                .rejectionReason(ticket.getRejectionReason())
                .fineType(ticket.getFineType().name())
                .voidReason(ticket.getVoidReason())
                .proofSubmittedAt(ticket.getProofSubmittedAt())
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    private String determineCause(FineTicket ticket) {
        return switch (ticket.getFineType()) {
            case OVERDUE -> "Phạt trả muộn";
            case DAMAGED -> "Phạt hư hỏng sách";
            case LOST -> "Phạt mất sách";
        };
    }
}
