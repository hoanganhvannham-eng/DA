package com.library.common.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String upload(MultipartFile file, String subDir);
    void delete(String key, String subDir);
}
