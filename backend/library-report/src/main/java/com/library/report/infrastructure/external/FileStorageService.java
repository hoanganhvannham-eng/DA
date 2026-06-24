package com.library.report.infrastructure.external;

import java.io.InputStream;

public interface FileStorageService {
    String upload(InputStream inputStream, String path);
    InputStream getFile(String url);
}
