package com.vayro.cabbooking.controller;

import com.vayro.cabbooking.dto.request.RideBookingRequest;
import com.vayro.cabbooking.dto.request.RideEstimateRequest;
import com.vayro.cabbooking.dto.response.RideEstimateResponse;
import com.vayro.cabbooking.dto.response.RideResponse;
import com.vayro.cabbooking.security.UserPrincipal;
import com.vayro.cabbooking.service.InvoiceService;
import com.vayro.cabbooking.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final InvoiceService invoiceService;

    @PostMapping("/estimate")
    public ResponseEntity<RideEstimateResponse> estimateFare(@Valid @RequestBody RideEstimateRequest request) {
        RideEstimateResponse response = rideService.estimateFare(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RideResponse> requestRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RideBookingRequest request
    ) {
        RideResponse response = rideService.requestRide(principal, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideResponse> getRideById(@PathVariable UUID id) {
        RideResponse response = rideService.getRideById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<RideResponse> cancelRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : "Cancelled by user";
        RideResponse response = rideService.cancelRide(principal, id, reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<RideResponse>> getRideHistory(@AuthenticationPrincipal UserPrincipal principal) {
        List<RideResponse> history = rideService.getUserRideHistory(principal);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable UUID id) {
        byte[] pdfBytes = invoiceService.generateInvoicePdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "vayro-invoice-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
