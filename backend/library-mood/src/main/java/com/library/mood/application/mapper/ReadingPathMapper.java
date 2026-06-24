package com.library.mood.application.mapper;

import com.library.mood.presentation.dto.response.ReadingPathDTO;
import com.library.mood.domain.ReadingPath;
import com.library.mood.domain.ReadingPathItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReadingPathMapper {

    public ReadingPathDTO toResponse(ReadingPath path, List<ReadingPathItem> items, ReadingPathDTO.PathItemDTO... itemDtos) {
        return ReadingPathDTO.builder()
                .id(path.getId())
                .readerId(path.getReaderId())
                .moodId(path.getMoodId())
                .items(itemDtos.length > 0 ? List.of(itemDtos) : null)
                .build();
    }

    public ReadingPathDTO.PathItemDTO toItemResponse(ReadingPathItem item) {
        return ReadingPathDTO.PathItemDTO.builder()
                .bookId(item.getBookId())
                .order(item.getOrder())
                .build();
    }
}
