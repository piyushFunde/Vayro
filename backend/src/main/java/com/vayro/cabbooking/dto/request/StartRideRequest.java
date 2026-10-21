package com.vayro.cabbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StartRideRequest {
    @NotBlank(message = "OTP is required to start ride")
    @Size(min = 4, max = 6, message = "OTP must be between 4 and 6 characters")
    private String otp;
}
