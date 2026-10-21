package com.vayro.cabbooking.dto.request;

import com.vayro.cabbooking.enums.VehicleType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RideEstimateRequest {
    @NotNull(message = "Pickup latitude is required")
    private Double pickupLat;

    @NotNull(message = "Pickup longitude is required")
    private Double pickupLng;

    @NotNull(message = "Drop latitude is required")
    private Double dropLat;

    @NotNull(message = "Drop longitude is required")
    private Double dropLng;

    private VehicleType vehicleType = VehicleType.SEDAN;
}
