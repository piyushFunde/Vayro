package com.vayro.cabbooking.dto.request;

import com.vayro.cabbooking.enums.DriverStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DriverStatusUpdateRequest {
    @NotNull(message = "Driver status is required")
    private DriverStatus status;
}
