package com.vayro.cabbooking.dto.request;

import com.vayro.cabbooking.enums.Role;
import com.vayro.cabbooking.enums.VehicleType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private Role role = Role.ROLE_RIDER;

    // Driver specific fields (if role == ROLE_DRIVER)
    private String vehicleModel;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String licenseNumber;
}
