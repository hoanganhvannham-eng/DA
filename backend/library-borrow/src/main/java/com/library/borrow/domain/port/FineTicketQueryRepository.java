package com.library.borrow.domain.port;

import java.util.UUID;

public interface FineTicketQueryRepository {

    int countUnpaidByReaderId(UUID readerId);

    int countPendingConfirmByReaderId(UUID readerId);
}
