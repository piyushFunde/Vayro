package com.vayro.cabbooking.service;

import com.vayro.cabbooking.dto.request.LoginRequest;
import com.vayro.cabbooking.dto.request.RegisterRequest;
import com.vayro.cabbooking.dto.response.AuthResponse;
import com.vayro.cabbooking.dto.response.DriverResponse;
import com.vayro.cabbooking.dto.response.UserResponse;
import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.User;
import com.vayro.cabbooking.enums.DriverStatus;
import com.vayro.cabbooking.enums.Role;
import com.vayro.cabbooking.enums.VehicleType;
import com.vayro.cabbooking.exception.BadRequestException;
import com.vayro.cabbooking.exception.ResourceNotFoundException;
import com.vayro.cabbooking.repository.DriverRepository;
import com.vayro.cabbooking.repository.UserRepository;
import com.vayro.cabbooking.security.JwtTokenProvider;
import com.vayro.cabbooking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number is already registered: " + request.getPhoneNumber());
        }

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_RIDER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        Driver driver = null;
        if (savedUser.getRole() == Role.ROLE_DRIVER) {
            driver = Driver.builder()
                    .user(savedUser)
                    .vehicleModel(request.getVehicleModel() != null ? request.getVehicleModel() : "Sedan Standard")
                    .vehicleNumber(request.getVehicleNumber() != null ? request.getVehicleNumber() : "CAB-" + System.currentTimeMillis() % 10000)
                    .vehicleType(request.getVehicleType() != null ? request.getVehicleType() : VehicleType.SEDAN)
                    .licenseNumber(request.getLicenseNumber() != null ? request.getLicenseNumber() : "DL-" + System.currentTimeMillis() % 10000)
                    .status(DriverStatus.OFFLINE)
                    .currentLat(37.7749) // Default San Francisco
                    .currentLng(-122.4194)
                    .ratingAvg(5.00)
                    .totalTrips(0)
                    .isVerified(true)
                    .build();
            driver = driverRepository.save(driver);
        }

        String token = tokenProvider.generateTokenForUser(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(savedUser))
                .driver(driver != null ? mapToDriverResponse(driver) : null)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DriverResponse driverResponse = null;
        if (user.getRole() == Role.ROLE_DRIVER) {
            Optional<Driver> driverOpt = driverRepository.findByUserId(user.getId());
            if (driverOpt.isPresent()) {
                driverResponse = mapToDriverResponse(driverOpt.get());
            }
        }

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .driver(driverResponse)
                .build();
    }

    public AuthResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DriverResponse driverResponse = null;
        if (user.getRole() == Role.ROLE_DRIVER) {
            driverResponse = driverRepository.findByUserId(user.getId())
                    .map(this::mapToDriverResponse)
                    .orElse(null);
        }

        String token = tokenProvider.generateTokenForUser(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .driver(driverResponse)
                .build();
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }

    public DriverResponse mapToDriverResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .user(mapToUserResponse(driver.getUser()))
                .vehicleModel(driver.getVehicleModel())
                .vehicleNumber(driver.getVehicleNumber())
                .vehicleType(driver.getVehicleType())
                .licenseNumber(driver.getLicenseNumber())
                .status(driver.getStatus())
                .currentLat(driver.getCurrentLat())
                .currentLng(driver.getCurrentLng())
                .ratingAvg(driver.getRatingAvg())
                .totalTrips(driver.getTotalTrips())
                .isVerified(driver.getIsVerified())
                .build();
    }
}
