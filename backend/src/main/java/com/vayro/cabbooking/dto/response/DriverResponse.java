package com.vayro.cabbooking.dto.response;

import com.vayro.cabbooking.enums.DriverStatus;
import com.vayro.cabbooking.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private UUID id;
    private UserResponse user;
    private String vehicleModel;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String licenseNumber;
    private DriverStatus status;
    private Double currentLat;
    private Double currentLng;
    private Double ratingAvg;
    private Integer totalTrips;
    private Boolean isVerified;
}
