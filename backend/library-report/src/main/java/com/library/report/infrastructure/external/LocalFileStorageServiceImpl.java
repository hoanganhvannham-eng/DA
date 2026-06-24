package com.library.report.infrastructure.external;

import com.library.common.constants.ErrorCode;
import com.library.report.config.ReportProperties;
import com.library.report.domain.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final ReportProperties reportProperties;

    public LocalFileStorageServiceImpl(ReportProperties reportProperties) {
        this.reportProperties = reportProperties;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(reportProperties.getStoragePath()));
        } catch (Exception e) {
            log.warn("Could not create report storage dir: {}", reportProperties.getStoragePath());
        }
    }

    @Override
    public String upload(InputStream inputStream, String path) {
        try {
            Path filePath = Paths.get(reportProperties.getStoragePath(), path);
            Files.createDirectories(filePath.getParent());
            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                inputStream.transferTo(fos);
            }
            return filePath.toString();
        } catch (Exception e) {
            throw new FileStorageException(ErrorCode.REPORT_FILE_STORAGE_UPLOAD_FAILED,
                    "Failed to upload file: " + path);
        }
    }

    @Override
    public InputStream getFile(String url) {
        try {
            Path filePath = Paths.get(url);
            return new FileInputStream(filePath.toFile());
        } catch (Exception e) {
            throw new FileStorageException(ErrorCode.FILE_STORAGE_DOWNLOAD_FAILED,
                    "Failed to get file: " + url);
        }
    }
}
