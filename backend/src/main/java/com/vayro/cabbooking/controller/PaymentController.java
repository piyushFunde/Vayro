package com.vayro.cabbooking.controller;

import com.vayro.cabbooking.dto.response.PaymentResponse;
import com.vayro.cabbooking.security.UserPrincipal;
import com.vayro.cabbooking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<PaymentResponse> createPaymentIntent(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> request
    ) {
        UUID rideId = UUID.fromString(request.get("rideId"));
        PaymentResponse response = paymentService.createPaymentIntent(principal, rideId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm/{rideId}")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable UUID rideId,
            @RequestBody(required = false) Map<String, String> request
    ) {
        String paymentIntentId = request != null ? request.get("paymentIntentId") : null;
        PaymentResponse response = paymentService.confirmPayment(rideId, paymentIntentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        // Acknowledge Stripe webhook event
        return ResponseEntity.ok("Webhook received");
    }
}
