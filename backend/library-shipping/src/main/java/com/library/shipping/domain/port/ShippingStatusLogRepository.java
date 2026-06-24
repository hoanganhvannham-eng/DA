package com.library.shipping.domain.port;

import com.library.shipping.domain.entity.ShippingStatusLog;

public interface ShippingStatusLogRepository {

    ShippingStatusLog save(ShippingStatusLog log);
}
