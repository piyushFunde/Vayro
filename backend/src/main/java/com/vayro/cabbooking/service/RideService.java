package com.vayro.cabbooking.service;

import com.vayro.cabbooking.dto.request.RideBookingRequest;
import com.vayro.cabbooking.dto.request.RideEstimateRequest;
import com.vayro.cabbooking.dto.response.RideEstimateResponse;
import com.vayro.cabbooking.dto.response.RideResponse;
import com.vayro.cabbooking.entity.*;
import com.vayro.cabbooking.enums.DriverStatus;
import com.vayro.cabbooking.enums.PaymentMethod;
import com.vayro.cabbooking.enums.PaymentStatus;
import com.vayro.cabbooking.enums.RideStatus;
import com.vayro.cabbooking.enums.VehicleType;
import com.vayro.cabbooking.exception.BadRequestException;
import com.vayro.cabbooking.exception.ResourceNotFoundException;
import com.vayro.cabbooking.repository.*;
import com.vayro.cabbooking.security.UserPrincipal;
import com.vayro.cabbooking.util.FareCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final PaymentRepository paymentRepository;
    private final FareCalculator fareCalculator;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;

    public RideEstimateResponse estimateFare(RideEstimateRequest request) {
        double distanceKm = fareCalculator.calculateDistanceKm(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropLat(), request.getDropLng()
        );
        int durationMinutes = fareCalculator.calculateDurationMinutes(distanceKm);

        Map<VehicleType, Double> breakdown = new EnumMap<>(VehicleType.class);
        for (VehicleType type : VehicleType.values()) {
            breakdown.put(type, fareCalculator.calculateFare(distanceKm, durationMinutes, type));
        }

        VehicleType selected = request.getVehicleType() != null ? request.getVehicleType() : VehicleType.SEDAN;

        return RideEstimateResponse.builder()
                .distanceKm(distanceKm)
                .durationMinutes(durationMinutes)
                .selectedVehicleType(selected)
                .estimatedFare(breakdown.get(selected))
                .fareBreakdownByVehicle(breakdown)
                .build();
    }

    @Transactional
    public RideResponse requestRide(UserPrincipal principal, RideBookingRequest request) {
        User rider = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Rider not found"));

        VehicleType vehicleType = request.getVehicleType() != null ? request.getVehicleType() : VehicleType.SEDAN;
        double distanceKm = fareCalculator.calculateDistanceKm(
                request.getPickupLat(), request.getPickupLng(),
                request.getDropLat(), request.getDropLng()
        );
        int durationMinutes = fareCalculator.calculateDurationMinutes(distanceKm);
        double baseFare = fareCalculator.calculateFare(distanceKm, durationMinutes, vehicleType);
        double finalFare = baseFare;

        PromoCode appliedPromo = null;
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            Optional<PromoCode> promoOpt = promoCodeRepository
                    .findByCodeIgnoreCaseAndIsActiveTrueAndValidUntilAfter(request.getPromoCode().trim(), LocalDateTime.now());
            if (promoOpt.isPresent()) {
                appliedPromo = promoOpt.get();
                double discount = Math.min((baseFare * appliedPromo.getDiscountPct()) / 100.0, appliedPromo.getMaxDiscount());
                finalFare = Math.max(5.0, baseFare - discount);
                appliedPromo.setTimesUsed(appliedPromo.getTimesUsed() + 1);
                promoCodeRepository.save(appliedPromo);
            }
        }

        // Generate 4-digit OTP for secure driver validation
        String otp = String.format("%04d", new Random().nextInt(10000));

        Ride ride = Ride.builder()
                .rider(rider)
                .pickupAddress(request.getPickupAddress())
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .dropAddress(request.getDropAddress())
                .dropLat(request.getDropLat())
                .dropLng(request.getDropLng())
                .distanceKm(distanceKm)
                .durationMinutes(durationMinutes)
                .vehicleType(vehicleType)
                .baseFare(baseFare)
                .finalFare(finalFare)
                .promoCode(appliedPromo)
                .status(RideStatus.REQUESTED)
                .otp(otp)
                .build();

        Ride savedRide = rideRepository.save(ride);
        RideResponse response = mapToRideResponse(savedRide);

        // Broadcast new ride opportunity to available drivers
        messagingTemplate.convertAndSend("/topic/drivers/requests", response);

        return response;
    }

    @Transactional
    public RideResponse acceptRide(UserPrincipal principal, UUID rideId) {
        Driver driver = driverRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        if (driver.getStatus() == DriverStatus.OFFLINE) {
            throw new BadRequestException("You must be ONLINE to accept rides");
        }

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED) {
            throw new BadRequestException("Ride is no longer available. Current status: " + ride.getStatus());
        }

        ride.setDriver(driver);
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        driver.setStatus(DriverStatus.BUSY);

        driverRepository.save(driver);
        Ride savedRide = rideRepository.save(ride);
        RideResponse response = mapToRideResponse(savedRide);

        // Broadcast to specific ride channel & general status channel
        messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/status", response);

        return response;
    }

    @Transactional
    public RideResponse driverArrived(UserPrincipal principal, UUID rideId) {
        Driver driver = driverRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not assigned to this ride");
        }

        ride.setStatus(RideStatus.DRIVER_ARRIVED);
        Ride savedRide = rideRepository.save(ride);
        RideResponse response = mapToRideResponse(savedRide);

        messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/status", response);
        return response;
    }

    @Transactional
    public RideResponse startRide(UserPrincipal principal, UUID rideId, String otp) {
        Driver driver = driverRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not assigned to this ride");
        }

        if (!ride.getOtp().equals(otp.trim())) {
            throw new BadRequestException("Invalid ride verification OTP. Please ask rider for correct PIN.");
        }

        ride.setStatus(RideStatus.IN_PROGRESS);
        ride.setStartTime(LocalDateTime.now());

        Ride savedRide = rideRepository.save(ride);
        RideResponse response = mapToRideResponse(savedRide);

        messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/status", response);
        return response;
    }

    @Transactional
    public RideResponse completeRide(UserPrincipal principal, UUID rideId) {
        Driver driver = driverRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("You are not assigned to this ride");
        }

        ride.setStatus(RideStatus.COMPLETED);
        ride.setEndTime(LocalDateTime.now());
        driver.setStatus(DriverStatus.AVAILABLE);
        driver.setTotalTrips(driver.getTotalTrips() + 1);

        driverRepository.save(driver);
        Ride savedRide = rideRepository.save(ride);

        // Auto-create or ensure pending payment record exists
        if (paymentRepository.findByRide(savedRide).isEmpty()) {
            Payment payment = Payment.builder()
                    .ride(savedRide)
                    .rider(savedRide.getRider())
                    .amount(savedRide.getFinalFare())
                    .currency("USD")
                    .method(PaymentMethod.STRIPE_CARD)
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);
        }

        RideResponse response = mapToRideResponse(savedRide);
        messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/status", response);
        return response;
    }

    @Transactional
    public RideResponse cancelRide(UserPrincipal principal, UUID rideId, String reason) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (ride.getStatus() == RideStatus.COMPLETED || ride.getStatus() == RideStatus.CANCELLED) {
            throw new BadRequestException("Ride cannot be cancelled in state: " + ride.getStatus());
        }

        ride.setStatus(RideStatus.CANCELLED);
        ride.setCancellationReason(reason != null ? reason : "Cancelled by user");

        if (ride.getDriver() != null) {
            Driver driver = ride.getDriver();
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }

        Ride savedRide = rideRepository.save(ride);
        RideResponse response = mapToRideResponse(savedRide);
        messagingTemplate.convertAndSend("/topic/ride/" + rideId + "/status", response);
        return response;
    }

    public RideResponse getRideById(UUID rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));
        return mapToRideResponse(ride);
    }

    public List<RideResponse> getUserRideHistory(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (principal.getRole().name().equals("ROLE_DRIVER")) {
            Driver driver = driverRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));
            return rideRepository.findByDriverOrderByCreatedAtDesc(driver).stream()
                    .map(this::mapToRideResponse)
                    .collect(Collectors.toList());
        }

        return rideRepository.findByRiderOrderByCreatedAtDesc(user).stream()
                .map(this::mapToRideResponse)
                .collect(Collectors.toList());
    }

    public RideResponse mapToRideResponse(Ride ride) {
        return RideResponse.builder()
                .id(ride.getId())
                .rider(authService.mapToUserResponse(ride.getRider()))
                .driver(ride.getDriver() != null ? authService.mapToDriverResponse(ride.getDriver()) : null)
                .pickupAddress(ride.getPickupAddress())
                .pickupLat(ride.getPickupLat())
                .pickupLng(ride.getPickupLng())
                .dropAddress(ride.getDropAddress())
                .dropLat(ride.getDropLat())
                .dropLng(ride.getDropLng())
                .distanceKm(ride.getDistanceKm())
                .durationMinutes(ride.getDurationMinutes())
                .vehicleType(ride.getVehicleType())
                .baseFare(ride.getBaseFare())
                .finalFare(ride.getFinalFare())
                .status(ride.getStatus())
                .otp(ride.getOtp())
                .startTime(ride.getStartTime())
                .endTime(ride.getEndTime())
                .createdAt(ride.getCreatedAt())
                .build();
    }
}
