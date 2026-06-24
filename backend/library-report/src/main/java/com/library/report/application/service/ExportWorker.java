package com.library.report.application.service;

import com.library.report.domain.entity.ExportRequest;
import com.library.report.domain.enums.ExportRequestStatus;
import com.library.report.domain.enums.ReportType;
import com.library.report.domain.enums.TimeRange;
import com.library.report.domain.repository.ExportRequestRepository;
import com.library.report.infrastructure.external.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportWorker {

    private final ExportRequestRepository exportRequestRepository;
    private final ReportQueryService reportQueryService;
    private final FileStorageService fileStorageService;

    @Scheduled(fixedDelay = 10000)
    public void processExportQueue() {
        ExportRequest request = exportRequestRepository.findNextQueued().orElse(null);
        if (request == null) {
            return;
        }

        try {
            request.setStatus(ExportRequestStatus.PROCESSING);
            exportRequestRepository.save(request);

            List<Map<String, Object>> dataset = reportQueryService.fetchFullDataset(
                    request.getReportType(), request.getTimeRange());

            byte[] csvBytes = generateCsv(request.getReportType(), dataset);

            String filePath = "reports/" + request.getId() + ".csv";
            fileStorageService.upload(new ByteArrayInputStream(csvBytes), filePath);

            request.setStatus(ExportRequestStatus.READY);
            request.setFileUrl(filePath);
            request.setCompletedAt(LocalDateTime.now());
            exportRequestRepository.save(request);

            log.info("Export completed: id={}, type={}", request.getId(), request.getReportType());
        } catch (Exception e) {
            log.error("Export failed: id={}, error={}", request.getId(), e.getMessage());
            request.setStatus(ExportRequestStatus.FAILED);
            request.setErrorMessage(e.getMessage() != null ? e.getMessage().substring(0, Math.min(e.getMessage().length(), 500)) : "Unknown error");
            exportRequestRepository.save(request);
        }
    }

    private byte[] generateCsv(ReportType reportType, List<Map<String, Object>> dataset) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);

            writer.write('\ufeff');

            String[] headers = getHeaders(reportType);
            writer.write(String.join(",", headers));
            writer.write("\r\n");

            if (dataset != null) {
                for (Map<String, Object> row : dataset) {
                    StringBuilder csvRow = new StringBuilder();
                    for (String header : headers) {
                        Object value = row.get(header);
                        if (csvRow.length() > 0) {
                            csvRow.append(',');
                        }
                        if (value != null) {
                            String str = value.toString();
                            if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
                                str = "\"" + str.replace("\"", "\"\"") + "\"";
                            }
                            csvRow.append(str);
                        }
                    }
                    csvRow.append("\r\n");
                    writer.write(csvRow.toString());
                }
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("CSV generation failed", e);
        }
    }

    private String[] getHeaders(ReportType reportType) {
        switch (reportType) {
            case BOOK:
                return new String[]{"book_id", "title", "author", "isbn", "category",
                        "total_quantity", "available_quantity", "borrowed_quantity",
                        "damaged_count", "lost_count"};
            case BORROW_RETURN:
                return new String[]{"borrow_id", "status", "book_title", "reader_name",
                        "borrow_date", "due_date", "returned_at", "fulfillment_method"};
            case FINE:
                return new String[]{"fine_id", "fine_type", "amount", "status",
                        "reader_name", "created_at", "confirmed_at"};
            case LOST_DAMAGED:
                return new String[]{"book_id", "title", "isbn", "reader_name",
                        "book_condition", "returned_at"};
            default:
                return new String[]{};
        }
    }
}
