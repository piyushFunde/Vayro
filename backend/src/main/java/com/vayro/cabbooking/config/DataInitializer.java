package com.vayro.cabbooking.config;

import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.PromoCode;
import com.vayro.cabbooking.entity.User;
import com.vayro.cabbooking.enums.DriverStatus;
import com.vayro.cabbooking.enums.Role;
import com.vayro.cabbooking.enums.VehicleType;
import com.vayro.cabbooking.repository.DriverRepository;
import com.vayro.cabbooking.repository.PromoCodeRepository;
import com.vayro.cabbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Admin Account
        User admin = User.builder()
                .email("admin@vayro.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("System Administrator")
                .phoneNumber("+15550000001")
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();
        userRepository.save(admin);

        // 2. Demo Rider
        User rider = User.builder()
                .email("rider@vayro.com")
                .password(passwordEncoder.encode("Rider@123"))
                .fullName("Alex Morgan")
                .phoneNumber("+15550000002")
                .role(Role.ROLE_RIDER)
                .isActive(true)
                .build();
        userRepository.save(rider);

        // 3. Demo Driver 1 (Sedan)
        User driverUser1 = User.builder()
                .email("driver1@vayro.com")
                .password(passwordEncoder.encode("Driver@123"))
                .fullName("Marcus Vance")
                .phoneNumber("+15550000003")
                .role(Role.ROLE_DRIVER)
                .isActive(true)
                .build();
        User savedDriverUser1 = userRepository.save(driverUser1);

        Driver driver1 = Driver.builder()
                .user(savedDriverUser1)
                .vehicleModel("Toyota Camry Hybrid")
                .vehicleNumber("CAB-9021")
                .vehicleType(VehicleType.SEDAN)
                .licenseNumber("DL-CA-88901")
                .status(DriverStatus.AVAILABLE)
                .currentLat(37.7749)
                .currentLng(-122.4194)
                .ratingAvg(4.92)
                .totalTrips(184)
                .isVerified(true)
                .build();
        driverRepository.save(driver1);

        // 4. Demo Driver 2 (Luxury EV)
        User driverUser2 = User.builder()
                .email("driver2@vayro.com")
                .password(passwordEncoder.encode("Driver@123"))
                .fullName("Elena Rostova")
                .phoneNumber("+15550000004")
                .role(Role.ROLE_DRIVER)
                .isActive(true)
                .build();
        User savedDriverUser2 = userRepository.save(driverUser2);

        Driver driver2 = Driver.builder()
                .user(savedDriverUser2)
                .vehicleModel("Tesla Model 3 Performance")
                .vehicleNumber("EV-4402")
                .vehicleType(VehicleType.LUXURY)
                .licenseNumber("DL-CA-99214")
                .status(DriverStatus.AVAILABLE)
                .currentLat(37.7833)
                .currentLng(-122.4167)
                .ratingAvg(4.98)
                .totalTrips(312)
                .isVerified(true)
                .build();
        driverRepository.save(driver2);

        // 5. Promo Codes
        PromoCode promo1 = PromoCode.builder()
                .code("VAYRO50")
                .discountPct(50.0)
                .maxDiscount(25.0)
                .validUntil(LocalDateTime.now().plusMonths(3))
                .usageLimit(500)
                .timesUsed(12)
                .isActive(true)
                .build();
        promoCodeRepository.save(promo1);

        PromoCode promo2 = PromoCode.builder()
                .code("WELCOME20")
                .discountPct(20.0)
                .maxDiscount(15.0)
                .validUntil(LocalDateTime.now().plusMonths(6))
                .usageLimit(1000)
                .timesUsed(45)
                .isActive(true)
                .build();
        promoCodeRepository.save(promo2);
    }
}
