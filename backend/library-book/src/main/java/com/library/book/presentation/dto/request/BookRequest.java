package com.library.book.presentation.dto.request;

import com.library.book.presentation.validation.ValidISBN;
import com.library.book.presentation.validation.ValidPublishedYear;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class BookRequest {

    @NotBlank(message = "Tên sách không được để trống")
    @Size(max = 100, message = "Tên sách tối đa 100 ký tự")
    private String title;

    @NotBlank(message = "Tác giả không được để trống")
    @Size(max = 100, message = "Tên tác giả tối đa 100 ký tự")
    private String author;

    @NotNull(message = "Năm xuất bản không được để trống")
    @ValidPublishedYear
    private Integer publishedYear;

    @ValidISBN
    private String isbn;

    @NotNull(message = "Thể loại không được để trống")
    private UUID categoryId;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    private String description;

    @NotNull(message = "Số lượng không được để trống")
    @Positive(message = "Số lượng phải lớn hơn 0")
    private Integer totalQuantity;

    @NotNull(message = "Giá trị sách không được để trống")
    @PositiveOrZero(message = "Giá trị sách phải >= 0")
    private BigDecimal replacementPrice;

    @NotNull(message = "Chính sách cọc không được để trống")
    private UUID depositPolicyId;

    @PositiveOrZero(message = "Tỷ lệ cọc phải >= 0")
    private Integer customDepositRate;
}
