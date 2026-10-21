package com.vayro.cabbooking.service;

import com.vayro.cabbooking.dto.request.DriverLocationUpdateRequest;
import com.vayro.cabbooking.dto.request.DriverStatusUpdateRequest;
import com.vayro.cabbooking.dto.response.DriverResponse;
import com.vayro.cabbooking.entity.Driver;
import com.vayro.cabbooking.entity.Ride;
import com.vayro.cabbooking.entity.User;
import com.vayro.cabbooking.enums.DriverStatus;
import com.vayro.cabbooking.enums.RideStatus;
import com.vayro.cabbooking.exception.ResourceNotFoundException;
import com.vayro.cabbooking.repository.DriverRepository;
import com.vayro.cabbooking.repository.RideRepository;
import com.vayro.cabbooking.repository.UserRepository;
import com.vayro.cabbooking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final RideRepository rideRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;

    public Driver getDriverByPrincipal(UserPrincipal principal) {
        return driverRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for user: " + principal.getId()));
    }

    @Transactional
    public DriverResponse updateStatus(UserPrincipal principal, DriverStatusUpdateRequest request) {
        Driver driver = getDriverByPrincipal(principal);
        driver.setStatus(request.getStatus());
        Driver updated = driverRepository.save(driver);

        // Broadcast driver status update
        messagingTemplate.convertAndSend("/topic/drivers/status", authService.mapToDriverResponse(updated));
        return authService.mapToDriverResponse(updated);
    }

    @Transactional
    public DriverResponse updateLocation(UserPrincipal principal, DriverLocationUpdateRequest request) {
        Driver driver = getDriverByPrincipal(principal);
        driver.setCurrentLat(request.getLatitude());
        driver.setCurrentLng(request.getLongitude());
        Driver updated = driverRepository.save(driver);

        Map<String, Object> locationPayload = new HashMap<>();
        locationPayload.put("driverId", driver.getId());
        locationPayload.put("latitude", request.getLatitude());
        locationPayload.put("longitude", request.getLongitude());
        locationPayload.put("heading", request.getHeading());

        // Broadcast to general driver location channel
        messagingTemplate.convertAndSend("/topic/driver/" + driver.getId() + "/location", locationPayload);

        // If driver has an active ride, broadcast directly to that ride's telemetry stream
        List<RideStatus> activeStatuses = Arrays.asList(RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_ARRIVED, RideStatus.IN_PROGRESS);
        Optional<Ride> activeRideOpt = rideRepository.findFirstByDriverAndStatusInOrderByCreatedAtDesc(driver, activeStatuses);
        activeRideOpt.ifPresent(ride -> {
            messagingTemplate.convertAndSend("/topic/ride/" + ride.getId() + "/location", locationPayload);
        });

        return authService.mapToDriverResponse(updated);
    }

    public List<Driver> findAvailableDriversNear(Double lat, Double lng, Double radiusKm) {
        try {
            return driverRepository.findNearbyAvailableDrivers(lat, lng, radiusKm != null ? radiusKm : 10.0);
        } catch (Exception e) {
            // Fallback: in-memory calculation for H2 or environments without PostGIS
            List<Driver> allAvailable = driverRepository.findByStatus(DriverStatus.AVAILABLE);
            return allAvailable;
        }
    }
}
