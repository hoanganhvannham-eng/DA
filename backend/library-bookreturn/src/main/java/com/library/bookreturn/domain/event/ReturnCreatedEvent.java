package com.library.bookreturn.domain.event;

import com.library.bookreturn.domain.enums.ReturnMethod;
import java.util.UUID;

public record ReturnCreatedEvent(
    UUID borrowRecordId,
    UUID readerId,
    UUID bookId,
    ReturnMethod returnMethod
) {}
