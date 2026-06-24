package com.library.common.storage;

import com.library.common.constants.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class DiskStorageService implements StorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final int TARGET_WIDTH = 800;
    private static final int TARGET_HEIGHT = 1200;

    private final Path baseDir;

    public DiskStorageService(@Value("${app.storage.base-dir}") String baseDir) {
        this.baseDir = Paths.get(baseDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.baseDir);
            log.info("Storage base directory ready: {}", this.baseDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create storage directory: " + this.baseDir, e);
        }
    }

    @Override
    public String upload(MultipartFile file, String subDir) {
        validateFile(file);

        String contentType = file.getContentType();
        String extension = "jpg";
        if ("image/png".equals(contentType)) {
            extension = "png";
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path subDirPath = this.baseDir.resolve(subDir);
        Path targetPath = subDirPath.resolve(filename);

        try {
            Files.createDirectories(subDirPath);

            try (InputStream is = file.getInputStream()) {
                BufferedImage image = ImageIO.read(is);
                if (image == null) {
                    throw new StorageException(ErrorCode.COVER_FORMAT_INVALID);
                }
            }

            try (InputStream is = file.getInputStream()) {
                Thumbnails.of(is)
                        .size(TARGET_WIDTH, TARGET_HEIGHT)
                        .outputFormat(extension)
                        .toFile(targetPath.toFile());
            }

            log.info("File uploaded: {}", targetPath);
            return filename;
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new StorageException(ErrorCode.COVER_UPLOAD_FAILED);
        }
    }

    @Override
    public void delete(String key, String subDir) {
        if (key == null || key.isBlank()) return;

        Path filePath = this.baseDir.resolve(subDir).resolve(key).normalize();

        if (!filePath.startsWith(this.baseDir)) {
            log.warn("Path traversal detected: {}", filePath);
            return;
        }

        try {
            Files.deleteIfExists(filePath);
            log.info("File deleted: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StorageException(ErrorCode.COVER_REQUIRED);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new StorageException(ErrorCode.COVER_FORMAT_INVALID);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new StorageException(ErrorCode.COVER_TOO_LARGE);
        }
    }
}
