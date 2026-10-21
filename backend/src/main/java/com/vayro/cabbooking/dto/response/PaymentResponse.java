package com.vayro.cabbooking.dto.response;

import com.vayro.cabbooking.enums.PaymentMethod;
import com.vayro.cabbooking.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID id;
    private UUID rideId;
    private Double amount;
    private String currency;
    private PaymentMethod method;
    private PaymentStatus status;
    private String stripeClientSecret;
    private String stripePaymentIntentId;
}
