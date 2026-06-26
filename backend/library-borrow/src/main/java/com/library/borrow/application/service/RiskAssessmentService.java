package com.library.borrow.application.service;

import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.borrow.domain.port.UserProfileRepository;
import com.library.fine.application.service.FineTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskAssessmentService {

    private static final int RISK_R1_THRESHOLD = 4;
    private static final int RISK_R2_THRESHOLD = 2;
    private static final int RISK_R4_GRACE_DAYS = 7;

    private final BorrowRecordRepository borrowRecordRepository;
    private final UserProfileRepository userProfileRepository;
    private final FineTicketService fineTicketService;

    @Transactional(readOnly = true)
    public RiskAssessmentResult assessRisk(UUID readerId, UUID bookId, boolean isLastCopy) {
        List<String> failedFlags = new ArrayList<>();
        int activeBorrows = borrowRecordRepository.countActiveByReaderId(readerId);

        if (activeBorrows >= RISK_R1_THRESHOLD) {
            failedFlags.add("R1");
        }

        int overdueCount = borrowRecordRepository.countOverdueInLast6Months(readerId.toString());
        if (overdueCount >= RISK_R2_THRESHOLD) {
            failedFlags.add("R2");
        }

        if (fineTicketService.isBorrowingBlocked(readerId)) {
            failedFlags.add("R3");
        }

        if (fineTicketService.isBorrowingBlocked(readerId)) {
            failedFlags.add("R3");
        }

        if (isLastCopy) {
            failedFlags.add("R5");
        }

        if (isLastCopy) {
            failedFlags.add("R5");
        }

        boolean allPassed = failedFlags.isEmpty();
        log.info("Risk assessment for readerId={}, bookId={}: allPassed={}, failedFlags={}",
                readerId, bookId, allPassed, failedFlags);

        return new RiskAssessmentResult(allPassed, failedFlags);
    }

    public record RiskAssessmentResult(boolean allPassed, List<String> failedFlags) {}
}
