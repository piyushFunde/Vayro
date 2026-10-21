package com.vayro.cabbooking.dto.response;

import com.vayro.cabbooking.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideEstimateResponse {
    private Double distanceKm;
    private Integer durationMinutes;
    private VehicleType selectedVehicleType;
    private Double estimatedFare;
    private Map<VehicleType, Double> fareBreakdownByVehicle;
}
