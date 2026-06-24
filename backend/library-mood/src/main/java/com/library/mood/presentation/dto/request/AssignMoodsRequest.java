package com.library.mood.presentation.dto.request;

import com.library.mood.presentation.validation.ValidMoodIds;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AssignMoodsRequest {

    @NotEmpty(message = "Phải chọn ít nhất một mood")
    @Size(max = 20, message = "Chỉ được chọn tối đa 20 mood")
    @ValidMoodIds
    private List<UUID> moodIds;
}
