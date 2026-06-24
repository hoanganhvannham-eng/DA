package com.library.report.infrastructure.persistence;

import com.library.report.domain.dto.dashboard.BookStatsDTO;
import com.library.report.domain.dto.dashboard.FineStatsDTO;
import com.library.report.domain.dto.dashboard.OverdueReaderDTO;
import com.library.report.domain.dto.dashboard.ReaderStatsDTO;
import com.library.report.domain.dto.dashboard.TopBookDTO;
import com.library.report.domain.dto.report.BookReportDTO.CategoryStats;
import com.library.report.domain.dto.report.BorrowReturnReportDTO.TimeBucket;
import com.library.report.domain.dto.report.FineReportDTO.DebtorInfo;
import com.library.report.domain.dto.report.LostDamagedReportDTO.LostDamagedRecord;
import com.library.report.domain.repository.ReportQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ReportQueryRepositoryImpl implements ReportQueryRepository {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public BookStatsDTO queryBookStats() {
        String inventorySql = "SELECT COALESCE(SUM(available_quantity), 0) AS total_available, " +
                "COALESCE(SUM(lost_count), 0) AS total_lost, " +
                "COALESCE(SUM(damaged_count), 0) AS total_damaged " +
                "FROM books WHERE is_deleted = false";

        BookStatsDTO stats = jdbcTemplate.queryForObject(inventorySql, (rs, rowNum) -> BookStatsDTO.builder()
                .totalAvailable(rs.getInt("total_available"))
                .totalLost(rs.getInt("total_lost"))
                .totalDamaged(rs.getInt("total_damaged"))
                .totalBorrowed(0)
                .build());

        String borrowedSql = "SELECT COUNT(*) AS total_borrowed FROM borrow_records " +
                "WHERE status IN ('BORROWING', 'OVERDUE')";

        int totalBorrowed = jdbcTemplate.queryForObject(borrowedSql, Integer.class);

        return BookStatsDTO.builder()
                .totalAvailable(stats.getTotalAvailable())
                .totalBorrowed(totalBorrowed)
                .totalLost(stats.getTotalLost())
                .totalDamaged(stats.getTotalDamaged())
                .build();
    }

    @Override
    public ReaderStatsDTO queryReaderStats() {
        String sql = "SELECT " +
                "COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS total_active, " +
                "COALESCE(SUM(CASE WHEN status = 'DISABLED' THEN 1 ELSE 0 END), 0) AS total_disabled " +
                "FROM users WHERE role = 'READER'";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> ReaderStatsDTO.builder()
                .totalActive(rs.getInt("total_active"))
                .totalDisabled(rs.getInt("total_disabled"))
                .build());
    }

    @Override
    public int queryTodayBorrowCount() {
        String sql = "SELECT COUNT(*) FROM borrow_records WHERE DATE(created_at) = CURRENT_DATE";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    @Override
    public List<TopBookDTO> queryTopBooks(int limit) {
        String sql = "SELECT BIN_TO_UUID(b.id, 0) AS id, b.title, COUNT(br.id) AS borrow_count " +
                "FROM borrow_records br JOIN books b ON br.book_id = b.id " +
                "GROUP BY b.id, b.title " +
                "ORDER BY borrow_count DESC LIMIT ?";

        return jdbcTemplate.query(sql, (ResultSet rs, int rowNum) -> TopBookDTO.builder()
                .rank(rowNum + 1)
                .bookId(UUID.fromString(rs.getString("id")))
                .title(rs.getString("title"))
                .borrowCount(rs.getInt("borrow_count"))
                .build(), limit);
    }

    @Override
    public List<OverdueReaderDTO> queryOverdueReaders() {
        String sql = "SELECT BIN_TO_UUID(a.id, 0) AS reader_id, a.name AS reader_name, " +
                "COUNT(br.id) AS overdue_count, " +
                "COALESCE(MAX(DATEDIFF(CURRENT_DATE, br.due_date)), 0) AS max_overdue_days " +
                "FROM borrow_records br JOIN users a ON br.reader_id = a.id " +
                "WHERE br.status = 'OVERDUE' " +
                "OR (br.status = 'BORROWING' AND br.due_date < CURRENT_DATE) " +
                "GROUP BY a.id, a.name " +
                "ORDER BY max_overdue_days DESC";

        List<OverdueReaderDTO> results = jdbcTemplate.query(sql, (rs, rowNum) -> OverdueReaderDTO.builder()
                .readerId(UUID.fromString(rs.getString("reader_id")))
                .readerName(rs.getString("reader_name"))
                .overdueCount(rs.getInt("overdue_count"))
                .maxOverdueDays(rs.getInt("max_overdue_days"))
                .build());

        return results != null ? results : new ArrayList<>();
    }

    @Override
    public FineStatsDTO queryFineStats() {
        String currentMonthSql =
            "SELECT " +
            "COALESCE(SUM(amount), 0) AS total_fines, " +
            "COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS paid, " +
            "COALESCE(SUM(CASE WHEN status = 'UNPAID' THEN amount ELSE 0 END), 0) AS unpaid, " +
            "COALESCE(SUM(CASE WHEN status = 'PENDING_CONFIRM' THEN amount ELSE 0 END), 0) AS pending " +
            "FROM fine_tickets " +
            "WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')";

        FineStatsDTO stats = jdbcTemplate.queryForObject(currentMonthSql,
            (rs, rowNum) -> FineStatsDTO.builder()
                .currentMonthTotal(rs.getDouble("total_fines"))
                .currentMonthPaid(rs.getDouble("paid"))
                .currentMonthUnpaid(rs.getDouble("unpaid"))
                .currentMonthPending(rs.getDouble("pending"))
                .last6MonthsTrend(new ArrayList<>())
                .build());

        String trendSql =
            "SELECT " +
            "DATE_FORMAT(created_at, '%Y-%m') AS month, " +
            "COALESCE(SUM(amount), 0) AS total, " +
            "COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS paid " +
            "FROM fine_tickets " +
            "WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH) " +
            "GROUP BY month " +
            "ORDER BY month ASC";

        List<FineStatsDTO.MonthlyFineTrend> trend =
            jdbcTemplate.query(trendSql, (rs, rowNum) -> FineStatsDTO.MonthlyFineTrend.builder()
                .month(rs.getString("month"))
                .total(rs.getDouble("total"))
                .paid(rs.getDouble("paid"))
                .build());

        return FineStatsDTO.builder()
                .currentMonthTotal(stats.getCurrentMonthTotal())
                .currentMonthPaid(stats.getCurrentMonthPaid())
                .currentMonthUnpaid(stats.getCurrentMonthUnpaid())
                .currentMonthPending(stats.getCurrentMonthPending())
                .last6MonthsTrend(trend != null ? trend : new ArrayList<>())
                .build();
    }

    // ========== UC25: Detailed report queries ==========

    @Override
    public List<CategoryStats> queryBookReport(LocalDateTime timeStart, LocalDateTime timeEnd) {
        String sql = "SELECT BIN_TO_UUID(c.id, 0) AS category_id, c.name AS category_name, " +
                "COUNT(DISTINCT b.id) AS total_books, " +
                "COUNT(DISTINCT br.id) AS borrow_count " +
                "FROM books b " +
                "LEFT JOIN categories c ON b.category_id = c.id " +
                "LEFT JOIN borrow_records br ON br.book_id = b.id " +
                "AND (? IS NULL OR br.created_at >= ?) " +
                "AND (? IS NULL OR br.created_at <= ?) " +
                "WHERE b.is_deleted = false " +
                "GROUP BY c.id, c.name " +
                "ORDER BY borrow_count DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> CategoryStats.builder()
                .categoryId(rs.getString("category_id"))
                .categoryName(rs.getString("category_name"))
                .totalBooks(rs.getInt("total_books"))
                .borrowCount(rs.getInt("borrow_count"))
                .build(), timeStart, timeStart, timeEnd, timeEnd);
    }

    @Override
    public List<TimeBucket> queryBorrowReturnReport(String period, LocalDateTime timeStart, LocalDateTime timeEnd) {
        String dateTruncSql;
        if ("YEAR".equals(period)) {
            dateTruncSql = "DATE_FORMAT(created_at, '%Y')";
        } else if ("QUARTER".equals(period)) {
            dateTruncSql = "CONCAT(DATE_FORMAT(created_at, '%Y'), '-Q', QUARTER(created_at))";
        } else if ("MONTH".equals(period)) {
            dateTruncSql = "DATE_FORMAT(created_at, '%Y-%m')";
        } else if ("WEEK".equals(period)) {
            dateTruncSql = "DATE_FORMAT(created_at, '%x-W%v')";
        } else {
            dateTruncSql = "DATE_FORMAT(created_at, '%Y-%m-%d')";
        }

        String sql = "SELECT " + dateTruncSql + " AS time_bucket, " +
                "COALESCE(SUM(CASE WHEN status IN ('BORROWING','OVERDUE','RETURNED','PENDING_APPROVAL','RESERVED','AWAITING_SHIPMENT','IN_DELIVERY','DELIVERED_PENDING') OR status LIKE 'RETURN_%' THEN 1 ELSE 0 END), 0) AS borrows, " +
                "COALESCE(SUM(CASE WHEN status = 'RETURNED' OR status IN ('RETURN_PENDING','RETURN_REQUESTED','RETURN_IN_TRANSIT','RETURN_RECEIVED','RETURN_SHIPPING_FAILED','RETURN_SHIPPING_LOST') THEN 1 ELSE 0 END), 0) AS returns " +
                "FROM borrow_records " +
                "WHERE (? IS NULL OR created_at >= ?) " +
                "AND (? IS NULL OR created_at <= ?) " +
                "GROUP BY time_bucket " +
                "ORDER BY time_bucket ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> TimeBucket.builder()
                .period(rs.getString("time_bucket"))
                .borrows(rs.getInt("borrows"))
                .returns(rs.getInt("returns"))
                .build(), timeStart, timeStart, timeEnd, timeEnd);
    }

    @Override
    public Double queryFineRevenue(LocalDateTime timeStart, LocalDateTime timeEnd) {
        String sql = "SELECT COALESCE(SUM(amount), 0) AS total_revenue " +
                "FROM fine_tickets " +
                "WHERE status = 'PAID' " +
                "AND (? IS NULL OR confirmed_at >= ?) " +
                "AND (? IS NULL OR confirmed_at <= ?)";

        return jdbcTemplate.queryForObject(sql, Double.class, timeStart, timeStart, timeEnd, timeEnd);
    }

    @Override
    public List<DebtorInfo> queryFineDebtors() {
        String sql = "SELECT BIN_TO_UUID(a.id, 0) AS reader_id, a.name AS reader_name, " +
                "COALESCE(SUM(ft.amount), 0) AS total_owed, " +
                "COUNT(ft.id) AS ticket_count " +
                "FROM fine_tickets ft " +
                "JOIN users a ON ft.reader_id = a.id " +
                "WHERE ft.status = 'UNPAID' " +
                "GROUP BY a.id, a.name " +
                "ORDER BY total_owed DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> DebtorInfo.builder()
                .readerId(rs.getString("reader_id"))
                .readerName(rs.getString("reader_name"))
                .totalOwed(rs.getDouble("total_owed"))
                .ticketCount(rs.getInt("ticket_count"))
                .build());
    }

    @Override
    public List<LostDamagedRecord> queryLostDamagedReport(LocalDateTime timeStart, LocalDateTime timeEnd) {
        String sql = "SELECT BIN_TO_UUID(b.id, 0) AS book_id, b.title, b.isbn, " +
                "BIN_TO_UUID(br.id, 0) AS borrow_id, br.book_condition, br.returned_at, " +
                "a.name AS reader_name " +
                "FROM borrow_records br " +
                "JOIN books b ON br.book_id = b.id " +
                "JOIN users a ON br.reader_id = a.id " +
                "WHERE br.book_condition IN ('LOST', 'DAMAGED') " +
                "AND (? IS NULL OR br.returned_at >= ?) " +
                "AND (? IS NULL OR br.returned_at <= ?) " +
                "ORDER BY br.returned_at DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> LostDamagedRecord.builder()
                .bookId(rs.getString("book_id"))
                .title(rs.getString("title"))
                .isbn(rs.getString("isbn"))
                .borrowId(rs.getString("borrow_id"))
                .bookCondition(rs.getString("book_condition"))
                .returnedAt(rs.getTimestamp("returned_at") != null
                        ? rs.getTimestamp("returned_at").toLocalDateTime() : null)
                .readerName(rs.getString("reader_name"))
                .build(), timeStart, timeStart, timeEnd, timeEnd);
    }

    @Override
    public int countRecords(String reportType, LocalDateTime timeStart, LocalDateTime timeEnd) {
        String table;
        String timeCol;
        String condition = "";

        switch (reportType) {
            case "BOOK":
                table = "books";
                timeCol = "created_at";
                condition = " AND is_deleted = false";
                break;
            case "BORROW_RETURN":
                table = "borrow_records";
                timeCol = "created_at";
                break;
            case "FINE":
                table = "fine_tickets";
                timeCol = "created_at";
                break;
            case "LOST_DAMAGED":
                table = "borrow_records";
                timeCol = "returned_at";
                condition = " AND book_condition IN ('LOST', 'DAMAGED')";
                break;
            default:
                return 0;
        }

        String sql = "SELECT COUNT(*) FROM " + table
                + " WHERE (? IS NULL OR " + timeCol + " >= ?)"
                + " AND (? IS NULL OR " + timeCol + " <= ?)"
                + condition;

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class,
                timeStart, timeStart, timeEnd, timeEnd);
        return count != null ? count : 0;
    }

    @Override
    public List<Map<String, Object>> fetchFullDataset(String reportType,
                                                       LocalDateTime timeStart, LocalDateTime timeEnd) {
        String sql;
        switch (reportType) {
            case "BOOK":
                sql = "SELECT BIN_TO_UUID(b.id, 0) AS book_id, b.title, b.author, b.isbn, " +
                        "c.name AS category, b.total_quantity, b.available_quantity, " +
                        "b.borrowed_quantity, b.damaged_count, b.lost_count " +
                        "FROM books b LEFT JOIN categories c ON b.category_id = c.id " +
                        "WHERE b.is_deleted = false";
                break;
            case "BORROW_RETURN":
                sql = "SELECT BIN_TO_UUID(br.id, 0) AS borrow_id, br.status, " +
                        "b.title AS book_title, a.name AS reader_name, " +
                        "br.borrow_date, br.due_date, br.returned_at, " +
                        "br.fulfillment_method " +
                        "FROM borrow_records br " +
                        "JOIN books b ON br.book_id = b.id " +
                        "JOIN users a ON br.reader_id = a.id " +
                        "WHERE (? IS NULL OR br.created_at >= ?) " +
                        "AND (? IS NULL OR br.created_at <= ?) " +
                        "ORDER BY br.created_at DESC";
                break;
            case "FINE":
                sql = "SELECT BIN_TO_UUID(ft.id, 0) AS fine_id, ft.fine_type, ft.amount, " +
                        "ft.status, a.name AS reader_name, ft.created_at, ft.confirmed_at " +
                        "FROM fine_tickets ft JOIN users a ON ft.reader_id = a.id " +
                        "WHERE (? IS NULL OR ft.created_at >= ?) " +
                        "AND (? IS NULL OR ft.created_at <= ?) " +
                        "ORDER BY ft.created_at DESC";
                break;
            case "LOST_DAMAGED":
                sql = "SELECT BIN_TO_UUID(b.id, 0) AS book_id, b.title, b.isbn, " +
                        "a.name AS reader_name, br.book_condition, br.returned_at " +
                        "FROM borrow_records br " +
                        "JOIN books b ON br.book_id = b.id " +
                        "JOIN users a ON br.reader_id = a.id " +
                        "WHERE br.book_condition IN ('LOST', 'DAMAGED') " +
                        "AND (? IS NULL OR br.returned_at >= ?) " +
                        "AND (? IS NULL OR br.returned_at <= ?) " +
                        "ORDER BY br.returned_at DESC";
                break;
            default:
                return new ArrayList<>();
        }

        if (reportType.equals("BOOK")) {
            return jdbcTemplate.queryForList(sql);
        }
        return jdbcTemplate.queryForList(sql, timeStart, timeStart, timeEnd, timeEnd);
    }
}
