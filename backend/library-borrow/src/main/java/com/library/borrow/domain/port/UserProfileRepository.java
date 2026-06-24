package com.library.borrow.domain.port;

import java.time.Instant;
import java.util.UUID;

public interface UserProfileRepository {

    String getAddressByUserId(UUID userId);

    String getNameByUserId(UUID userId);

    Instant getJoinedDateByUserId(UUID userId);
}
