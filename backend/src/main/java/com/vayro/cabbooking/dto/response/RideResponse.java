package com.vayro.cabbooking.dto.response;

import com.vayro.cabbooking.enums.RideStatus;
import com.vayro.cabbooking.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideResponse {
    private UUID id;
    private UserResponse rider;
    private DriverResponse driver;
    private String pickupAddress;
    private Double pickupLat;
    private Double pickupLng;
    private String dropAddress;
    private Double dropLat;
    private Double dropLng;
    private Double distanceKm;
    private Integer durationMinutes;
    private VehicleType vehicleType;
    private Double baseFare;
    private Double finalFare;
    private RideStatus status;
    private String otp;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
}
