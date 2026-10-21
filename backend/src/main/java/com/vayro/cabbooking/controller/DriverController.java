package com.vayro.cabbooking.controller;

import com.vayro.cabbooking.dto.request.DriverLocationUpdateRequest;
import com.vayro.cabbooking.dto.request.DriverStatusUpdateRequest;
import com.vayro.cabbooking.dto.request.StartRideRequest;
import com.vayro.cabbooking.dto.response.DriverResponse;
import com.vayro.cabbooking.dto.response.RideResponse;
import com.vayro.cabbooking.security.UserPrincipal;
import com.vayro.cabbooking.service.DriverService;
import com.vayro.cabbooking.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {

    private final DriverService driverService;
    private final RideService rideService;

    @PatchMapping("/status")
    public ResponseEntity<DriverResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DriverStatusUpdateRequest request
    ) {
        DriverResponse response = driverService.updateStatus(principal, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/location")
    public ResponseEntity<DriverResponse> updateLocation(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DriverLocationUpdateRequest request
    ) {
        DriverResponse response = driverService.updateLocation(principal, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rides/{id}/accept")
    public ResponseEntity<RideResponse> acceptRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        RideResponse response = rideService.acceptRide(principal, id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rides/{id}/arrive")
    public ResponseEntity<RideResponse> markArrived(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        RideResponse response = rideService.driverArrived(principal, id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rides/{id}/start")
    public ResponseEntity<RideResponse> startRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody StartRideRequest request
    ) {
        RideResponse response = rideService.startRide(principal, id, request.getOtp());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rides/{id}/complete")
    public ResponseEntity<RideResponse> completeRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        RideResponse response = rideService.completeRide(principal, id);
        return ResponseEntity.ok(response);
    }
}
