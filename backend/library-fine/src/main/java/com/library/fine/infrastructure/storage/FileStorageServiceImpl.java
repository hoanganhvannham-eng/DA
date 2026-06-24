package com.library.fine.infrastructure.storage;

import com.library.fine.application.service.FileStorageService;
import com.library.fine.domain.exception.FileStorageUploadFailedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path uploadDir;

    public FileStorageServiceImpl(
            @Value("${app.storage.upload-dir:uploads/fines}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.uploadDir, e);
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String path) {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = uploadDir.resolve(filename).normalize();

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File uploaded: {}", targetPath);
            return "/uploads/fines/" + filename;
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new FileStorageUploadFailedException();
        }
    }
}
