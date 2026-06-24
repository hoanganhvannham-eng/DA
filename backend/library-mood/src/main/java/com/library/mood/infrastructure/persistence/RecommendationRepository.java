package com.library.mood.infrastructure.persistence;

import com.library.mood.application.dto.BookRecommendation;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public class RecommendationRepository {

    private final JdbcTemplate jdbcTemplate;

    public RecommendationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<BookRecommendation> findBooksByMoodOrderByPopularity(UUID moodId) {
        String sql = """
            SELECT BIN_TO_UUID(b.id) AS id, b.title, b.author, c.name AS category_name, b.borrowed_quantity
            FROM books b
            JOIN book_mood_mappings bm ON b.id = bm.book_id
            JOIN categories c ON b.category_id = c.id
            WHERE bm.mood_id = UUID_TO_BIN(?, 0)
            AND b.is_deleted = 0
            ORDER BY b.borrowed_quantity DESC
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> new BookRecommendation(
                UUID.fromString(rs.getString("id")),
                rs.getString("title"),
                rs.getString("author"),
                rs.getString("category_name"),
                BigDecimal.valueOf(rs.getLong("borrowed_quantity"))
        ), moodId.toString());
    }

    public List<UUID> findExistingBookIds(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        String placeholders = String.join(",", ids.stream().map(id -> "UUID_TO_BIN(?, 0)").toList());
        String sql = "SELECT BIN_TO_UUID(id) FROM books WHERE id IN (" + placeholders + ") AND is_deleted = 0";

        List<String> stringIds = ids.stream().map(UUID::toString).toList();
        return jdbcTemplate.query(sql, (rs, rowNum) -> UUID.fromString(rs.getString(1)), stringIds.toArray());
    }
}
