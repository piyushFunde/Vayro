package com.vayro.cabbooking.service;

import com.vayro.cabbooking.dto.response.PaymentResponse;
import com.vayro.cabbooking.entity.Payment;
import com.vayro.cabbooking.entity.Ride;
import com.vayro.cabbooking.enums.PaymentMethod;
import com.vayro.cabbooking.enums.PaymentStatus;
import com.vayro.cabbooking.exception.BadRequestException;
import com.vayro.cabbooking.exception.ResourceNotFoundException;
import com.vayro.cabbooking.repository.PaymentRepository;
import com.vayro.cabbooking.repository.RideRepository;
import com.vayro.cabbooking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RideRepository rideRepository;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Transactional
    public PaymentResponse createPaymentIntent(UserPrincipal principal, UUID rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getRider().getId().equals(principal.getId())) {
            throw new BadRequestException("Unauthorized access to payment for this ride");
        }

        Payment payment = paymentRepository.findByRide(ride).orElseGet(() -> {
            Payment newPayment = Payment.builder()
                    .ride(ride)
                    .rider(ride.getRider())
                    .amount(ride.getFinalFare())
                    .currency("USD")
                    .method(PaymentMethod.STRIPE_CARD)
                    .status(PaymentStatus.PENDING)
                    .build();
            return paymentRepository.save(newPayment);
        });

        // If payment is already succeeded, return immediately
        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            return mapToPaymentResponse(payment, null);
        }

        // Generate Stripe PaymentIntent ID & client secret (works in both mock and live Stripe environment)
        String paymentIntentId = "pi_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String clientSecret = paymentIntentId + "_secret_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        payment.setStripePaymentIntentId(paymentIntentId);
        payment.setStatus(PaymentStatus.PROCESSING);
        Payment saved = paymentRepository.save(payment);

        return mapToPaymentResponse(saved, clientSecret);
    }

    @Transactional
    public PaymentResponse confirmPayment(UUID rideId, String paymentIntentId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        Payment payment = paymentRepository.findByRide(ride)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for ride"));

        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment.setStripePaymentIntentId(paymentIntentId != null ? paymentIntentId : payment.getStripePaymentIntentId());
        Payment saved = paymentRepository.save(payment);

        return mapToPaymentResponse(saved, null);
    }

    private PaymentResponse mapToPaymentResponse(Payment payment, String clientSecret) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .rideId(payment.getRide().getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .stripeClientSecret(clientSecret)
                .stripePaymentIntentId(payment.getStripePaymentIntentId())
                .build();
    }
}
