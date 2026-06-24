package com.library.book.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookListResponse {

    private List<BookListItem> items;
    private int page;
    private int pageSize;
    private long totalItems;
    private int totalPages;
    private String traceId;
}
