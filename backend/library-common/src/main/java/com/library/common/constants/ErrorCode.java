package com.library.common.constants;

/**
 * Centralized error codes for the entire system.
 * Each error code maps to a specific HTTP status and user-facing message.
 *
 * @see com.library.common.exception.GlobalExceptionHandler
 */
public enum ErrorCode {

    // --- Validation ---
    VALIDATION_FAILED(400, "Dữ liệu đầu vào không hợp lệ"),

    // --- Auth: Registration & Email Verification ---
    AUTH_DUPLICATE_EMAIL(409, "Email đã được sử dụng"),
    AUTH_INVALID_EMAIL_DOMAIN(400, "Email chỉ chấp nhận đuôi @library.com hoặc @gmail.com"),
    AUTH_TOKEN_NOT_FOUND(404, "Link xác nhận không hợp lệ"),
    AUTH_TOKEN_ALREADY_USED(400, "Link đã được sử dụng"),
    AUTH_TOKEN_EXPIRED(410, "Link đã hết hạn. Vui lòng yêu cầu lại"),
    AUTH_INVALID_ACCOUNT_STATE(400, "Tài khoản không ở trạng thái chờ xác nhận"),

    // --- Auth: Login & Session ---
    AUTH_INVALID_CREDENTIALS(401, "Email hoặc mật khẩu không đúng"),
    AUTH_ACCOUNT_PENDING(403, "Vui lòng xác nhận tài khoản qua email"),
    AUTH_ACCOUNT_DISABLED(403, "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên"),
    AUTH_TOO_MANY_ATTEMPTS(429, "Đã vượt quá số lần thử. Vui lòng thử lại sau 15 phút"),
    AUTH_UNAUTHORIZED(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),
    AUTH_SESSION_REVOKED(401, "Phiên đăng nhập đã bị thu hồi"),

    // --- Auth: Password ---
    AUTH_INVALID_OLD_PASSWORD(400, "Mật khẩu cũ không đúng"),
    AUTH_SAME_PASSWORD(400, "Mật khẩu mới không được trùng với mật khẩu cũ"),
    AUTH_USER_NOT_FOUND(404, "Người dùng không tồn tại"),
    AUTH_FORBIDDEN(403, "Bạn không có quyền thực hiện thao tác này"),

    // --- F02: Category Management ---
    CATEGORY_NOT_FOUND(404, "Thể loại không tồn tại"),
    CATEGORY_NAME_ALREADY_EXISTS(409, "Tên thể loại đã tồn tại"),
    CATEGORY_HAS_BOOKS(409, "Không thể xóa thể loại đang có sách"),
    CATEGORY_NOT_EXISTS(400, "Thể loại không tồn tại"),

    // --- F02: Book Management ---
    BOOK_NOT_FOUND(404, "Sách không tồn tại"),
    INVALID_ISBN_FORMAT(400, "ISBN không đúng định dạng ISBN-10 hoặc ISBN-13"),
    ISBN_ALREADY_EXISTS(409, "ISBN đã được sử dụng cho sách khác"),
    BOOK_INVENTORY_CONFLICT(409, "Không thể giảm số lượng thấp hơn số đơn mượn đang hoạt động"),
    BOOK_HAS_ACTIVE_BORROWS(409, "Không thể xóa sách đang có đơn mượn hoạt động"),
    INVALID_SORT_OPTION(400, "Tham số sắp xếp không hợp lệ"),
    INVALID_PAGE(400, "Số trang phải >= 1"),

    // --- F03: Mood Management ---
    MOOD_NOT_FOUND(404, "Mood không tồn tại"),
    MOOD_DUPLICATE_NAME(409, "Tên mood đã tồn tại"),
    MOOD_ASSIGNED_DELETE_FORBIDDEN(409, "Không thể xóa mood đang được gán cho sách"),

    // --- F03: Mood (UC12) ---
    INVALID_MOOD_IDS(400, "Mood không thuộc danh sách hợp lệ"),

    // --- F03: Reading Path (UC13) ---
    READING_PATH_ITEMS_INVALID(400, "Lộ trình phải có 3-7 sách"),
    READING_PATH_INVALID_BOOKS(400, "Sách không hợp lệ"),
    INSUFFICIENT_BOOKS_FOR_PATH(409, "Không đủ sách để tạo lộ trình. Vui lòng chọn mood khác"),

    // --- F04: Borrow Management ---
    BORROW_OUT_OF_STOCK(409, "Sách không còn sẵn, vui lòng thử lại"),
    MAX_ACTIVE_BORROWS(409, "Đã mượn tối đa 5 cuốn"),
    UNPAID_FINES_EXIST(409, "Có khoản phạt chưa thanh toán"),
    BORROW_NOT_FOUND(404, "Đơn mượn không tồn tại"),
    INVALID_STATUS_TRANSITION(409, "Đơn mượn không ở trạng thái phù hợp"),
    REJECT_REASON_REQUIRED(400, "Vui lòng nhập lý do từ chối"),
    REJECT_REASON_TOO_LONG(400, "Lý do tối đa 500 ký tự"),
    BORROW_ALREADY_CANCELLED(409, "Đơn mượn đã hết hạn xử lý"),
    STATUS_FILTER_INVALID(400, "Trạng thái lọc không hợp lệ"),

    // --- F05: Return Management ---
    RETURN_DUPLICATE_REQUEST(409, "Đã có yêu cầu trả sách đang xử lý"),
    RETURN_STATUS_INVALID(409, "Đơn mượn không ở trạng thái có thể trả sách"),
    RETURN_SHIPPING_NOT_ALLOWED_FOR_FULFILLMENT(400, "Chỉ đơn Delivery mới được trả qua shipping"),
    RETURN_BORROW_NOT_FOUND(404, "Đơn mượn không tồn tại"),
    RETURN_PICKUP_ADDRESS_REQUIRED(400, "Vui lòng nhập địa chỉ lấy hàng"),
    RETURN_PICKUP_ADDRESS_TOO_LONG(400, "Địa chỉ tối đa 255 ký tự"),
    RETURN_CONFIRM_CONDITION_REQUIRED(400, "Vui lòng chọn tình trạng sách"),
    RETURN_CONFIRM_FINE_LEVEL_REQUIRED(400, "Chưa chọn mức phạt"),
    RETURN_CONFIRM_NOTE_REQUIRED(400, "Ghi chú không hợp lệ"),
    RETURN_CONFIRM_NOTE_TOO_LONG(400, "Ghi chú tối đa 500 ký tự"),
    RETURN_BOOK_MISMATCH(409, "Sách trả không đúng với đơn mượn"),
    RETURN_SHIPPING_ATTEMPT_LIMIT_EXCEEDED(409, "Đã đạt giới hạn số lần gửi trả qua shipping"),
    RETURN_SHIPPING_LOST_RESOLUTION_REQUIRED(400, "Cần chọn hướng xử lý cho đơn trả bị mất"),
    RETURN_DB_TRANSACTION_FAILED(500, "Hệ thống đang gặp sự cố. Vui lòng thử lại sau"),
    BULK_CONFIRM_INVALID_CONDITION(400, "Xác nhận hàng loạt chỉ hỗ trợ tình trạng NORMAL"),

    // --- F06: Fine Level Management (UC19) ---
    FINE_LEVEL_NOT_FOUND(404, "Mức phạt không tồn tại"),
    FINE_LEVEL_IN_USE(409, "Không thể xóa mức phạt đang được sử dụng"),
    FINE_LEVEL_DATE_INVALID(400, "Ngày phạt phải trong vòng 30 ngày trước"),

    // --- F06: Fine Payment (UC20) ---
    FINE_TICKET_NOT_FOUND(404, "Phiếu phạt không tồn tại"),
    FINE_PAY_STATUS_NOT_ALLOWED(409, "Phiếu phạt không ở trạng thái cho phép thanh toán"),
    FINE_PROOF_REQUIRED(400, "Vui lòng upload minh chứng thanh toán"),
    FINE_PROOF_FORMAT_INVALID(400, "Minh chứng phải là định dạng JPG/PNG"),
    FINE_PROOF_TOO_LARGE(400, "Dung lượng ảnh tối đa 5MB"),
    FILE_STORAGE_UPLOAD_FAILED(502, "Không thể tải lên minh chứng. Vui lòng thử lại"),

    // --- F06: Fine Reconciliation (UC21) ---
    FINE_NOT_PENDING_CONFIRM(409, "Phiếu phạt không ở trạng thái chờ xác nhận"),
    REJECTION_REASON_REQUIRED(400, "Vui lòng nhập lý do từ chối"),
    REJECTION_REASON_TOO_LONG(400, "Lý do từ chối tối đa 500 ký tự"),

    // --- F07: User Management ---
    USER_NOT_FOUND(404, "Người dùng không tồn tại"),
    USER_ROLE_INVALID(400, "Giá trị vai trò không hợp lệ. Chỉ chấp nhận: READER, LIBRARIAN, ADMIN"),
    USER_STATUS_INVALID(400, "Giá trị trạng thái không hợp lệ. Chỉ chấp nhận: ACTIVE, DISABLED"),
    USER_SELF_DEACTIVATE_FORBIDDEN(409, "Không thể vô hiệu hóa tài khoản của chính bạn"),
    USER_SELF_ROLE_CHANGE_FORBIDDEN(409, "Không thể thay đổi vai trò của chính bạn"),
    USER_LAST_ADMIN_VIOLATION(409, "Hệ thống phải có ít nhất 1 quản lý viên"),

    // --- F09: Shipping Management (UC26–UC30) ---
    SHIPPING_BORROW_NOT_FOUND(404, "Đơn mượn không tồn tại"),
    SHIPPING_INVALID_STATE(409, "Đơn mượn không ở trạng thái phù hợp để tạo đơn giao hàng"),
    SHIPPING_FULFILLMENT_MISMATCH(409, "Đơn mượn không phải phương thức giao tận nơi"),
    SHIPPING_ATTEMPT_LIMIT_EXCEEDED(409, "Đã đạt giới hạn số lần giao hàng (tối đa 3 lần)"),
    SHIPPING_INVENTORY_CONFLICT(409, "Sách không còn trên kệ. Đơn mượn chuyển sang trạng thái có vấn đề giao hàng"),
    SHIPPING_PROVIDER_UNAVAILABLE(502, "Dịch vụ vận chuyển tạm thời không khả dụng. Vui lòng thử lại sau"),
    SHIPPING_ORDER_NOT_FOUND(404, "Đơn vận chuyển không tồn tại"),
    SHIPPING_BORROW_ALREADY_STARTED(409, "Đơn vận chuyển đã bắt đầu, không thể hủy"),

    // --- F08: Report & Dashboard (UC24, UC25) ---
    REPORT_FORBIDDEN(403, "Bạn không có quyền truy cập chức năng này"),
    REPORT_DB_QUERY_FAILED(500, "Hệ thống đang gặp sự cố. Vui lòng thử lại sau"),
    REPORT_TYPE_INVALID(400, "Loại báo cáo không hợp lệ. Chấp nhận: BOOK, BORROW_RETURN, FINE, LOST_DAMAGED"),
    TIME_RANGE_INVALID(400, "Khoảng thời gian không hợp lệ. Chấp nhận: DAY, WEEK, MONTH, QUARTER, YEAR"),
    REPORT_EXPORT_EMPTY_DATASET(422, "Không có dữ liệu để xuất"),
    EXPORT_REQUEST_NOT_FOUND(404, "Yêu cầu xuất báo cáo không tồn tại"),
    EXPORT_NOT_READY(409, "File CSV chưa sẵn sàng. Vui lòng đợi xử lý xong"),
    EXPORT_RETRY_NOT_ALLOWED(409, "Chỉ có thể thử lại khi xuất báo cáo thất bại"),
    REPORT_FILE_STORAGE_UPLOAD_FAILED(502, "Không thể lưu file báo cáo. Vui lòng thử lại"),
    FILE_STORAGE_DOWNLOAD_FAILED(502, "Không thể tải file từ hệ thống lưu trữ"),

    // --- Wallet & Payment ---
    WALLET_NOT_FOUND(404, "Ví tiền không tồn tại"),
    WALLET_INSUFFICIENT_BALANCE(409, "Số dư không đủ để thực hiện giao dịch"),
    PAYMENT_NOT_FOUND(404, "Giao dịch thanh toán không tồn tại"),
    PAYMENT_NOT_PENDING(409, "Giao dịch không ở trạng thái chờ xử lý"),
    PAYMENT_AMOUNT_INVALID(400, "Số tiền nạp phải lớn hơn 0"),

    // --- Storage ---
    COVER_REQUIRED(400, "Vui lòng chọn ảnh bìa"),
    COVER_FORMAT_INVALID(400, "Ảnh bìa phải là định dạng JPG hoặc PNG"),
    COVER_TOO_LARGE(400, "Dung lượng ảnh bìa tối đa 5MB"),
    COVER_UPLOAD_FAILED(502, "Không thể tải lên ảnh bìa. Vui lòng thử lại"),

    // --- System ---
    SYSTEM_ERROR(500, "Hệ thống đang gặp sự cố. Vui lòng thử lại sau");

    private final int httpStatus;
    private final String message;

    ErrorCode(int httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public String getMessage() {
        return message;
    }
}
